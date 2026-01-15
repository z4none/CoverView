# AI 功能快速配置 (支持 OpenRouter + Pollinations)

## 🔧 OpenRouter API 配置

### 1. 获取 OpenRouter API Key

1. 访问 [OpenRouter.ai](https://openrouter.ai)
2. 注册/登录账号
3. 进入 Dashboard → API Keys
4. 点击 "Create new key"
5. 复制生成的 API Key

### 2. 配置环境变量

在 `.env.local` 文件中添加：

```env
REACT_APP_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

### 3. 重启应用

```bash
npm start
```

## 🎯 使用 AI 标题优化

1. 在 Editor 页面输入博客标题
2. 选择优化风格（专业/吸引人/简洁）
3. 点击 "🤖 AI 优化标题" 按钮
4. 等待 AI 生成多个优化方案
5. 选择喜欢的方案或继续编辑

## 💡 功能特点

- **三种优化风格**: 专业、吸引人、简洁
- **多方案生成**: 每次生成3个优化选项
- **一键应用**: 点击即可使用建议标题
- **实时预览**: 立即看到优化效果

## ⚙️ 模型配置

### 环境变量配置

在 `.env.local` 中可以自定义每个 AI 功能使用的模型：

```env
# 基础配置
REACT_APP_OPENROUTER_API_KEY=your-key-here

# 模型配置 (可选)
REACT_APP_AI_TITLE_MODEL=anthropic/claude-3-haiku
REACT_APP_AI_COLOR_MODEL=openai/gpt-4o-mini
REACT_APP_AI_ICON_MODEL=anthropic/claude-3-haiku
REACT_APP_AI_IMAGE_MODEL=dall-e-3
```

### 推荐模型

| 模型 | 成本 (1K tokens) | 特点 | 推荐用途 |
|------|------------------|------|----------|
| `anthropic/claude-3-haiku` | ~$0.0003 | 高性价比，响应快 | 标题优化、图标推荐 |
| `openai/gpt-4o-mini` | ~$0.00015 | 超低成本，质量好 | 配色推荐、简单任务 |
| `anthropic/claude-3-sonnet` | ~$0.003 | 高质量，理解强 | 复杂标题优化 |
| `meta-llama/llama-3.1-8b-instruct` | ~$0.00005 | 开源，最便宜 | 测试、实验 |

## 🎨 AI 图片生成 (Pollinations)

### 特点
- **完全免费** - 无需 API Key，无使用限制
- **多种风格** - 写实、艺术、动漫、幻想、赛博朋克、极简
- **智能提示** - 基于标题自动生成优化提示词
- **即时生成** - 几秒钟获得高质量图片

### 使用方法
1. 点击 "🎨 AI 生成背景图片" 按钮
2. 选择喜欢的风格（写实、艺术、动漫等）
3. AI 会自动根据你的标题生成提示词
4. 点击 "🚀 生成图片" 等待几秒
5. 选择喜欢的图片应用到封面

### 配置
无需任何配置！Pollinations 是免费的，直接使用即可。

如果想修改，可在 `.env.local` 中设置：
```env
# 默认已使用 Pollinations
REACT_APP_AI_IMAGE_MODEL=pollinations/flux
```

## 📊 成本说明

### 文本生成成本

- **最便宜**: `meta-llama/llama-3.1-8b-instruct` ~$0.00005/次
- **性价比**: `anthropic/claude-3-haiku` ~$0.0003/次 (默认)
- **平衡型**: `openai/gpt-4o-mini` ~$0.00015/次
- **高质量**: `anthropic/claude-3-sonnet` ~$0.003/次

### 图片生成成本

- **Pollinations**: **完全免费** 🎉
- **DALL-E 3**: ~$0.04/次 (付费选项)

### 配额控制

- 免费用户: 10次文本优化 + 无限图片生成
- Pro 用户: 500次文本优化 + 无限图片生成
- 企业用户: 无限制

## ❓ 常见问题

**Q: 为什么没有反应？**
A: 检查 OpenRouter API Key 是否正确配置，查看浏览器控制台错误信息。

**Q: 生成质量不理想？**
A: 尝试不同的优化风格，或者调整原始标题的描述。

**Q: 如何查看使用次数？**
A: 在 Editor 页面顶部会显示剩余的 AI 使用次数。

## 🚀 下一步功能

- 智能配色推荐
- AI 图标推荐  
- 批量生成方案
- AI 背景图生成