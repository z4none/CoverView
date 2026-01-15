-- 1. 修改 user_usage 表，添加 credits 字段
ALTER TABLE public.user_usage 
ADD COLUMN IF NOT EXISTS credits int DEFAULT 100;

-- 2. (可选) 如果你想保留旧的历史统计数据，可以保留原有字段，
-- 但逻辑上我们以后主要看 credits。
-- 我们也可以把现有的用户 credits 初始化为 100 (或根据规则补发)
UPDATE public.user_usage 
SET credits = 100 
WHERE credits IS NULL;

-- 3. 创建一个存储过程来处理扣费（原子操作）
-- 这比在 Edge Function 分两步查+改更安全，防止并发扣费导致余额为负
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid, 
  p_amount int
) 
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER -- 以定义者权限运行，绕过 RLS 检查
AS $$
DECLARE
  v_current_credits int;
  v_new_credits int;
BEGIN
  -- 锁定行以防止并发竞争条件
  SELECT credits INTO v_current_credits
  FROM public.user_usage
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 如果用户不存在，尝试创建（给予初始 100）
  IF NOT FOUND THEN
    INSERT INTO public.user_usage (user_id, credits)
    VALUES (p_user_id, 100)
    RETURNING credits INTO v_current_credits;
  END IF;

  -- 检查余额
  IF v_current_credits < p_amount THEN
    RETURN json_build_object(
      'success', false, 
      'message', '余额不足', 
      'current_credits', v_current_credits
    );
  END IF;

  -- 扣除积分
  UPDATE public.user_usage
  SET 
    credits = credits - p_amount,
    total_usage = coalesce(total_usage, 0) + 1,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_credits;

  RETURN json_build_object(
    'success', true, 
    'message', '扣费成功', 
    'current_credits', v_new_credits
  );
END;
$$;
