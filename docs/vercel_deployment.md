# CoverView Vercel 部署手册

本手册涵盖了将 CoverView 前端部署到 Vercel 以及将后端 Edge Functions 部署到 Supabase 的完整流程。

## 1. 环境变量准备

### Vercel (前端)
在 Vercel 项目设置 (Settings -> Environment Variables) 中添加以下变量：

| 变量名 | 描述 | 示例值 |
| :--- | :--- | :--- |
| `REACT_APP_SUPABASE_URL` | Supabase 项目 URL | `https://your-project.supabase.co` |
| `REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase Anon Key | `eyJxh...` |
| `REACT_APP_UNSPLASH_ACCESS_KEY` | Unsplash API Key | `FsLJ...` |
| `REACT_APP_AI_TITLE_MODEL` | (可选) 默认标题优化模型 | `anthropic/claude-3-haiku` |
| `REACT_APP_AI_COLOR_MODEL` | (可选) 默认配色模型 | `anthropic/claude-3-haiku` |
| `REACT_APP_AI_ICON_MODEL` | (可选) 默认图标推荐模型 | `anthropic/claude-3-haiku` |
| `REACT_APP_AI_IMAGE_MODEL` | (可选) 默认图片生成模型 | `pollinations/flux` |

> ⚠️ **注意**: 不要在 Vercel 中设置 `REACT_APP_OPENROUTER_API_KEY`。该 Key 现已移至服务端 (Supabase Edge Functions) 以保证安全。

### Supabase (后端)
在 Supabase Dashboard 或使用 CLI 设置 Edge Functions 的 Secrets：

```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## 2. 部署 Supabase Edge Functions

确保你的本地已安装 Supabase CLI 并登录。

```bash
# 登录 Supabase
supabase login

# 链接到你的远程项目 (Project Ref 可以在 Supabase Dashboard URL 中找到)
supabase link --project-ref your-project-ref

# 部署所有 Functions (optimize-title, generate-image)
supabase functions deploy
```

## 3. 部署前端到 Vercel

1.  **连接 GitHub**: 将代码推送到 GitHub 仓库。
2.  **导入 Vercel**: 在 Vercel Dashboard 点击 "Add New..." -> "Project"，选择你的 CoverView 仓库。
3.  **配置构建**:
    - **Framework Preset**: Create React App
    - **Build Command**: `npm run build`
    - **Output Directory**: `build`
4.  **填入环境变量**: 参照第 1 步填入表格中的变量。
5.  **点击 Deploy**。

## 4. 部署检查清单 (Pre-flight Check)

- [ ] **Supabase Secrets**: 确认 `OPENROUTER_API_KEY` 已在 Supabase 中设置。
- [ ] **Edge Functions**: 确认 `optimize-title` 和 `generate-image` 已成功部署且状态为 Active。
- [ ] **Vercel Env**: 确认 Vercel 环境变量中**没有**包含敏感的 API Key (`OPENROUTER_API_KEY` 及其 `REACT_APP_` 版本)。
- [ ] **功能测试**:
    - [ ] 访问 Vercel 生成的预览链接。
    - [ ] 测试 "Optimize Title" (调用 Edge Function)。
    - [ ] 测试 "Generate Image" (调用 Edge Function)。
    - [ ] 测试 Unsplash 图片搜索。
    - [ ] 测试 Theme 2/3/4 的文字颜色是否为黑色。
    - [ ] 测试 Theme 5 的文字颜色是否随背景变化。

## 5. 故障排除

- **Edge Function 报错**: 查看 Supabase Dashboard -> Edge Functions -> Logs。
- **前端页面 404**: 确认根目录存在 `vercel.json` 且包含 rewrite 规则。
- **Unsplash 无法加载**: 检查 `REACT_APP_UNSPLASH_ACCESS_KEY` 是否正确，且 Unsplash 应用权限是否受限（Demo 模式限制每小时 50 次请求）。
