import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
    prompt: string;
    style?: string;
    model?: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. 验证用户身份
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        // 2. 初始化 Admin 客户端（用于安全的数据库操作）
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. 扣除积分 (Deduct 10 Credits)
        // 使用 RPC 原子操作预扣费
        const COST = 10;
        const { data: deductResult, error: deductError } = await supabaseAdmin
            .rpc('deduct_credits', {
                p_user_id: user.id,
                p_amount: COST,
                p_description: 'AI Image Generation',
                p_metadata: { model: 'zimage' }
            });

        if (deductError) {
            throw new Error(`Draft transaction failed: ${deductError.message}`);
        }

        if (!deductResult.success) {
            throw new Error(`Insufficient credits (Requires ${COST}, Current ${deductResult.current_credits}). Please top up or wait for next month reset.`);
        }

        const currentCredits = deductResult.current_credits;

        // 4. Prompt Refinement via LLM (OpenRouter)
        const { prompt: userDescription, title, style = 'realistic', model = 'zimage' }: GenerateRequest = await req.json()

        let refinedPrompt = userDescription;

        // Only refine if we have a title or description
        if (title || userDescription) {
            const apiKey = Deno.env.get('OPENROUTER_API_KEY');
            if (apiKey) {
                console.log(`Refining prompt for: ${title} - ${style}`);
                try {
                    const llmResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://coverview.vercel.app',
                            'X-Title': 'CoverView Image Gen'
                        },
                        body: JSON.stringify({
                            model: 'anthropic/claude-3-haiku', // Fast & cheap
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are an expert Text-to-Image Prompt Engineer. Your goal is to write a highly detailed, artistic, and effective prompt for an AI image generator based on the user\'s blog title and description. Return ONLY the prompt, no other text.'
                                },
                                {
                                    role: 'user',
                                    content: `Create a prompt for a blog cover image.
Blog Title: "${title || 'Untitled'}"
Style: ${style}
User Description: "${userDescription || 'A creative cover image'}"

Requirements:
1. Focus on visual elements, lighting, composition, and texture.
2. Incorporate elements related to the title and description.
3. Ensure the style matches the requested "${style}" style.
4. The output must be English.
5. Keep it under 100 words.
6. Return ONLY the prompt.`
                                }
                            ],
                            max_tokens: 200
                        })
                    });

                    if (llmResponse.ok) {
                        const llmData = await llmResponse.json();
                        const aiPrompt = llmData.choices?.[0]?.message?.content?.trim();
                        if (aiPrompt) {
                            refinedPrompt = aiPrompt;
                            console.log(`Refined Prompt: ${refinedPrompt}`);
                        }
                    } else {
                        console.warn('LLM refinement failed, using raw description');
                    }
                } catch (e) {
                    console.error('LLM error:', e);
                }
            } else {
                console.warn('OPENROUTER_API_KEY not set, skipping refinement');
            }
        }

        // 5. 执行图片生成逻辑 (Pollinations AI)
        // 风格映射 (与前端保持一致)
        const styleMap: Record<string, string> = {
            realistic: 'photorealistic, 8k, highly detailed, professional photography, soft lighting',
            artistic: 'digital art, oil painting style, expressive brushstrokes, artistic composition',
            anime: 'anime style, studio ghibli style, vibrant colors, cel shaded, high quality',
            fantasy: 'fantasy art, magical atmosphere, ethereal, dreamlike, intricate details',
            cyberpunk: 'cyberpunk style, neon lights, futuristic city, sci-fi, high tech, synthwave',
            minimalist: 'minimalist design, flat style, clean lines, simple, vector art, less is more'
        };

        const selectedStyle = styleMap[style] || 'photorealistic';
        // Combine refined prompt with style keywords for maximum effect
        const fullPrompt = `${refinedPrompt}, ${selectedStyle}`;

        // Pollinations Params
        const width = 1024;
        const height = 512;
        const seed = Math.floor(Math.random() * 1000000);
        const enhance = true;
        const nologo = true;

        const baseUrl = 'https://gen.pollinations.ai/image';
        const encodedPrompt = encodeURIComponent(fullPrompt);

        // 构建 Query Parameters
        const params = new URLSearchParams({
            model: model || 'zimage',
            width: width.toString(),
            height: height.toString(),
            seed: seed.toString(),
            enhance: enhance.toString(),
            nologo: nologo.toString(),
            safe: 'true'
        });

        const imageUrl = `${baseUrl}/${encodedPrompt}?${params.toString()}`;

        // 在服务端 Fetch 图片
        console.log(`Generating image for user ${user.id}: ${imageUrl}`);

        const pollinationsToken = Deno.env.get('POLLINATIONS_TOKEN');
        const headers: Record<string, string> = {};

        if (pollinationsToken) {
            headers['Authorization'] = `Bearer ${pollinationsToken}`;
        }

        const imageResponse = await fetch(imageUrl, {
            headers: headers
        });

        if (!imageResponse.ok) {
            console.error('Image generation failed after deduction');
            const errorText = await imageResponse.text();
            throw new Error(`Image provider error: ${imageResponse.status} ${imageResponse.statusText}`);
        }

        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const dataUrl = `data:${imageBlob.type};base64,${base64}`;

        // 6. 返回结果
        return new Response(
            JSON.stringify({
                url: dataUrl,
                credits: currentCredits,
                cost: COST,
                prompt: refinedPrompt // Return the refined prompt so user can see it
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
