# CoverView - Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织，创建新项目
4. 等待项目创建完成（约1-2分钟）

## 2. 获取项目配置

在项目设置中找到以下信息：

```
Project URL: https://your-project-id.supabase.co
API Key: sb_publishable_your_api_key_here
```

## 3. 配置 GitHub OAuth

### 3.1 创建 GitHub OAuth App

1. 访问 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. 填写信息：
   - **Application name**: CoverView
   - **Homepage URL**: `https://your-project-id.supabase.co`
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
3. 点击 "Register application"
4. 复制 **Client ID** 和生成 **Client Secret**

### 3.2 在 Supabase 中配置

1. 在 Supabase Dashboard 中：
   - 导航到 `Authentication` > `Providers`
   - 找到 GitHub provider
   - 启用并填入 GitHub 的 Client ID 和 Client Secret

## 4. 设置环境变量

创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_your_api_key_here
```

## 5. 运行数据库迁移

1. 在 Supabase Dashboard 中：
   - 导航到 `SQL Editor`
   - 粘贴 `supabase/schema.sql` 中的内容
   - 点击 "Run" 执行

## 6. 测试配置

```bash
npm install
npm start
```

访问应用，点击 "Continue with GitHub" 测试登录功能。

## 故障排除

### GitHub OAuth 重定向错误
- 确保 GitHub 中的回调 URL 完全匹配 Supabase 项目的 URL
- 检查 HTTPS 是否正确配置

### 认证状态不更新
- 清除浏览器缓存和 localStorage
- 确认环境变量正确设置

### 数据库权限错误
- 确认 RLS (Row Level Security) 策略正确执行
- 检查用户 ID 是否正确关联

## 安全注意事项

- **永远不要**在前端暴露 `service_role` 密钥
- 定期轮换 GitHub OAuth 应用密钥
- 在生产环境中启用额外的安全策略