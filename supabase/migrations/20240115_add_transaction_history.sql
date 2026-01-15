-- 1. 创建 credit_transactions 表来记录每次积分变动
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    amount int NOT NULL, -- 负数表示消耗，正数表示充值
    balance_after int NOT NULL, -- 变动后的余额
    description text, -- 例如 "生成图片", "标题优化", "初始赠送"
    metadata jsonb DEFAULT '{}'::jsonb, -- 存储额外信息，如图片ID、Prompt等
    created_at timestamp with time zone DEFAULT now()
);

-- 2. 启用 RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 3. 创建策略：用户只能查看自己的交易记录
CREATE POLICY "Users can view own transactions"
    ON public.credit_transactions FOR SELECT
    USING ( auth.uid() = user_id );

-- 4. 修改 deduct_credits 函数，使其自动写入交易记录
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid, 
  p_amount int,
  p_description text DEFAULT 'Usage',
  p_metadata jsonb DEFAULT '{}'::jsonb
) 
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  v_current_credits int;
  v_new_credits int;
BEGIN
  -- 锁定并检查
  SELECT credits INTO v_current_credits
  FROM public.user_usage
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 自动初始化
  IF NOT FOUND THEN
    INSERT INTO public.user_usage (user_id, credits)
    VALUES (p_user_id, 100)
    RETURNING credits INTO v_current_credits;
    
    -- 记录初始化赠送
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, description)
    VALUES (p_user_id, 100, 100, '初始赠送');
  END IF;

  -- 余额不足检查
  IF v_current_credits < p_amount THEN
    RETURN json_build_object('success', false, 'message', '余额不足', 'current_credits', v_current_credits);
  END IF;

  -- 扣费更新
  v_new_credits := v_current_credits - p_amount;
  
  UPDATE public.user_usage
  SET 
    credits = v_new_credits,
    total_usage = coalesce(total_usage, 0) + 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- 写入交易日志
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, description, metadata)
  VALUES (p_user_id, -p_amount, v_new_credits, p_description, p_metadata);

  RETURN json_build_object('success', true, 'message', '扣费成功', 'current_credits', v_new_credits);
END;
$$;
