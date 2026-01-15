-- 创建 user_usage 表来追踪用户使用量
create table if not exists public.user_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  ai_optimizations int default 0,
  old_image_generations int default 0, -- 保留旧字段以防万一
  image_generations int default 0,
  color_recommendations int default 0,
  total_usage int default 0,
  last_reset_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用 RLS (Row Level Security)
alter table public.user_usage enable row level security;

-- 创建策略：用户只能查看自己的使用量
create policy "Users can view own usage"
  on public.user_usage for select
  using ( auth.uid() = user_id );

-- 创建策略：用户不能直接更新使用量（必须通过 Edge Function）
-- 实际上，如果我们完全通过 Edge Function (Service Role) 更新，我们不需要给用户 update 权限。
-- 但为了兼容之前的 useUsageTracker 前端逻辑，我们暂时允许用户 update，
-- 等切换到 Edge Function 后，您可以移除这个 Update 策略以提高安全性。
create policy "Users can update own usage"
  on public.user_usage for update
  using ( auth.uid() = user_id );

-- 创建策略：允许用户插入自己的初始记录
create policy "Users can insert own usage"
  on public.user_usage for insert
  with check ( auth.uid() = user_id );

-- 自动更新 updated_at 的函数
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_usage_updated
  before update on public.user_usage
  for each row execute procedure public.handle_updated_at();

-- (可选) 每月重置额度的 Cron Job 可以在 Supabase Dashboard 中配置
-- 或者简单的在 Edge Function 中检查 last_reset_date 是否是上个月
