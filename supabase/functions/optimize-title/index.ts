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

        // 3. 扣除积分 (Deduct 1 Credit)
        const COST = 1;
        const { data: deductResult, error: deductError } = await supabaseAdmin
            .rpc('deduct_credits', {
                p_user_id: user.id,
                p_amount: COST,
                p_description: 'AI 标题优化',
                p_metadata: { type: 'title' }
            });

        if (deductError) {
            throw new Error(`Transaction failed: ${deductError.message}`);
        }

        if (!deductResult.success) {
            throw new Error(`积分不足 (需要 ${COST}, 当前 ${deductResult.current_credits})。`);
        }

        const currentCredits = deductResult.current_credits;

        // 4. 准备提示词 (复用原来的逻辑)
        const { title, style = 'professional', model = 'anthropic/claude-3-haiku' }: OptimizeRequest = await req.json()

        const prompts: Record<string, any> = {
            professional: {
                system: "你是一个专业的标题优化专家。请将给定的博客标题优化得更专业、更吸引人、更适合技术博客。",
                prompt: `请优化以下博客标题，使其更专业、更有吸引力："${title}"
        
要求：
1. 保持原意不变
2. 使用更专业的词汇
3. 突出技术要点
4. 长度控制在60字以内
5. 提供3个优化方案，每个方案一行

优化后的标题：`
            },
            catchy: {
                system: "你是一个病毒式内容创作专家。请将标题优化得更具吸引力和病毒传播性。",
                prompt: `请将以下博客标题优化得更具吸引人、更可能病毒传播："${title}"
        
要求：
1. 使用情感化词汇
2. 突出价值和收益
3. 可以使用数字和列表
4. 长度控制在60字以内
5. 提供3个优化方案，每个方案一行

优化后的标题：`
            },
            simple: {
                system: "你是一个内容简化专家。请将复杂的标题简化，让新手也能轻松理解。",
                prompt: `请将以下博客标题简化，让读者更容易理解："${title}"
        
要求：
1. 去除专业术语
2. 使用简单易懂的词汇
3. 突出核心概念
4. 长度控制在60字以内
5. 提供3个优化方案，每个方案一行
6. 仅提供优化后的标题，无需进行说明

优化后的标题：`
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
