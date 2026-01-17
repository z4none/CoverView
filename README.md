# CoverView

Creating cover images for your blogs is now super easy.

fork from [cover-img](https://github.com/rutikwankhade/CoverView)

## ✨ 主要改进 (vs 原版)

本项目在原版基础进行了深度的二次开发和增强，主要包含：

1.  **🤖 AI 深度集成**
    *   **智能优化**: 集成 OpenRouter (Gemini 等)，支持一键优化封面标题。
    *   **AI 绘图**: 内置 Pollinations.AI 接口（及 Licyuan 代理），支持生成动漫/写实风格背景图。
    *   **安全架构**: 所有 AI 请求通过 **Supabase Edge Functions** 转发，杜绝 API Key 前端泄露。

2.  **🔐 完整的用户体系**
    *   集成 **Supabase Auth**，支持 GitHub 一键登录。
    *   新增 **积分系统** (Credits)，精准追踪 AI 功能调用消耗。
    *   新增 **个人中心**，可查看详细的积分消耗和充值记录。

3.  **🎨 体验与功能升级**
    *   **增强图标选择器**: 支持 2000+ 图标搜索、分类筛选及本地缓存，大幅提升加载速度。
    *   **更多主题**: 新增 "Mobile Mockup" 等现代化主题，优化现有主题的配色逻辑（自动对比度）。
    *   **黑暗模式**: 核心组件适配黑暗模式。

4.  **⚙️ 工程化与部署**
    *   **Vercel 适配**: 完善 `vercel.json` 配置，支持 SPA 路由和后端函数部署。
    *   **代码质量**: 修复大量 ESLint 错误、Hook 依赖问题及构建警告，提升代码稳定性。
    *   **文档完善**: 提供详尽的 Supabase 配置和部署指南。


## 📖 文档

- **[使用指南](./docs/README.md)** - 项目介绍和功能说明
- **[配置指南](./docs/SUPABASE_SETUP.md)** - Supabase 认证系统配置

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp docs/.env.example .env.local
# 编辑 .env.local 填入你的配置
```

### 3. 配置数据库
按照 [配置指南](./docs/SUPABASE_SETUP.md) 设置 Supabase 项目和数据库。

### 4. 启动项目
```bash
npm start
```

访问 `http://localhost:3000` 开始使用！

## ⚡ 主要功能

- 🚀 超快速度，简单易用
- ✨ Unsplash 图片搜索集成
- 🌈 7 种不同主题，多种字体选择
- 🌠 100+ 开发图标，支持自定义上传
- 💾 基于博客平台的封面尺寸（Hashnode、Dev）
- 🔐 用户登录和使用量限制
- 🤖 AI 功能（开发中）

## 🛠️ 技术栈

- **前端**: React 16 + TailwindCSS
- **认证**: Supabase Auth + GitHub OAuth
- **图片处理**: dom-to-image
- **图标**: Unsplash API + Devicons

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── App.js          # 主应用和路由
│   ├── Home.js         # 首页
│   ├── Editor.js       # 编辑器
│   ├── Themes/         # 主题组件
│   └── ...
├── contexts/           # React Context
│   └── AuthContext.js  # 认证状态管理
├── hooks/              # 自定义 Hooks
│   └── useUsageTracker.js  # 使用量追踪
├── utils/              # 工具函数
└── assets/             # 静态资源

docs/                   # 文档
├── README.md           # 详细说明
├── SUPABASE_SETUP.md   # 配置指南
└── supabase/           # 数据库脚本
    └── schema.sql
```

## 🤝 贡献

欢迎提交 Pull Request！重要改动请先创建 Issue 讨论。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件。