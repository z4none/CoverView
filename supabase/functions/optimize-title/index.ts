import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OptimizeRequest {
    title: string;
    style?: string;
    model?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. 验证用户身份
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // 2. 初始化 Admin 客户端
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Deduct Credits
        const COST = 1;
        const { data: deductResult, error: deductError } = await supabaseAdmin
            .rpc('deduct_credits', {
                p_user_id: user.id,
                p_amount: COST,
                p_description: 'AI Title Optimization',
                p_metadata: { type: 'title' }
            });

        if (deductError) {
            throw new Error(`Transaction failed: ${deductError.message}`);
        }

        if (!deductResult.success) {
            throw new Error(`Insufficient credits (Requires ${COST}, Current ${deductResult.current_credits}).`);
        }

        const currentCredits = deductResult.current_credits;

        // 4. Prepare Prompts
        const { title, style = 'professional', model = 'anthropic/claude-3-haiku' }: OptimizeRequest = await req.json()

        const prompts: Record<string, any> = {
            professional: {
                system: "You are a professional title optimization expert. Please optimize the given blog title to be more professional, attractive, and suitable for technical blogs.",
                prompt: `Please optimize the following blog title to be more professional and attractive: "${title}"
        
Requirements:
1. Keep the original meaning
2. Use professional vocabulary
3. Highlight technical points
4. Keep length within 60 characters
5. Provide 3 optimized options, one per line

Optimized titles:`
            },
            catchy: {
                system: "You are a viral content creation expert. Please optimize the title to be more attractive and viral.",
                prompt: `Please optimize the following blog title to be more engaging and likely to go viral: "${title}"
        
Requirements:
1. Use emotional vocabulary
2. Highlight value and benefits
3. Use numbers and lists
4. Keep length within 60 characters
5. Provide 3 optimized options, one per line

Optimized titles:`
            },
            simple: {
                system: "You are a content simplification expert. Please simplify complex titles so beginners can easily understand them.",
                prompt: `Please simplify the following blog title for easier understanding: "${title}"
        
Requirements:
1. Remove professional jargon
2. Use simple and easy-to-understand vocabulary
3. Highlight core concepts
4. Keep length within 60 characters
5. Provide 3 optimized options, one per line
6. Provide only the optimized titles, no explanations

Optimized titles:`
            }
        };

        const config = prompts[style] || prompts.professional;
        const apiKey = Deno.env.get('OPENROUTER_API_KEY');

        if (!apiKey) throw new Error('Server misconfiguration: Missing OpenRouter Key');

        // 5. 调用 OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://coverview.vercel.app',
                'X-Title': 'CoverView'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: config.system },
                    { role: 'user', content: config.prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            console.error('OpenRouter failed after deduction');
            // TODO: Implement refund logic here
            const err = await response.text();
            throw new Error(`OpenRouter Error: ${err}`);
        }

        const data = await response.json();

        let suggestions: string[] = [];
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const result = data.choices[0].message.content.trim();
            suggestions = result.split('\n')
                .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
                .filter((line: string) => line.length > 0);

            if (suggestions.length === 0) suggestions = [result];
        } else {
            throw new Error('Invalid AI response');
        }

        // 6. 返回成功响应
        return new Response(
            JSON.stringify({
                suggestions,
                credits: currentCredits,
                cost: COST
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
