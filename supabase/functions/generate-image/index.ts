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
                p_description: 'AI 图像生成',
                p_metadata: { model: 'zimage' }
            });

        if (deductError) {
            throw new Error(`Draft transaction failed: ${deductError.message}`);
        }

        if (!deductResult.success) {
            throw new Error(`积分不足 (需要 ${COST}, 当前 ${deductResult.current_credits})。请充值或等待次月重置。`);
        }

        const currentCredits = deductResult.current_credits;

        // 4. 执行图片生成逻辑 (Pollinations AI)
        const { prompt, style = 'realistic', model = 'zimage' }: GenerateRequest = await req.json()

        // 风格映射 (与前端保持一致)
        const styleMap: Record<string, string> = {
            realistic: 'photorealistic, 8k, highly detailed',
            artistic: 'digital art, oil painting style',
            anime: 'anime style, studio ghibli style, vibrant colors',
            fantasy: 'fantasy art, magical atmosphere, ethereal',
            cyberpunk: 'cyberpunk style, neon lights, futuristic city',
            minimalist: 'minimalist design, flat style, clean lines, simple'
        };

        const selectedStyle = styleMap[style] || 'photorealistic';
        const fullPrompt = `${prompt}, ${selectedStyle}`;

        // Pollinations Params
        const width = 1024;
        const height = 512;
        const seed = Math.floor(Math.random() * 1000000);
        const enhance = true;
        const nologo = true;
        // 根据文档，negative_prompt 默认是 "worst quality, blurry"

        const baseUrl = 'https://gen.pollinations.ai/image';
        // Python example puts prompt in path
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

        // 在服务端 Fetch 图片，隐藏源地址并确保可用性
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
            // 如果生成失败，理论上应该退款 (refund)，这里简化处理，仅记录错误
            // 您可以添加一个 refund_credits 的 RPC 来回滚
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
                cost: COST
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
