# 快速开始指南

## 🚀 5分钟运行 CoverView

### 前置要求
- Node.js 14+ 
- Git
- GitHub 账号（用于登录）

### 步骤 1: 安装项目

```bash
git clone https://github.com/rutikwankhade/CoverView.git
cd CoverView
npm install
```

### 步骤 2: 配置 Supabase（可选，推荐）

如果不配置，部分功能将受限：

```bash
# 复制环境变量模板
cp docs/.env.example .env.local

# 按照 SUPABASE_SETUP.md 配置 Supabase
```

### 步骤 3: 启动项目

```bash
npm start
```

访问 `http://localhost:3000` 即可使用！

## 🎯 核心功能测试

### 1. 创建封面图片
1. 点击 "Continue with GitHub" 登录（如果配置了 Supabase）
2. 进入编辑器，输入标题和作者名
3. 选择主题、颜色、图标
4. 点击导出按钮保存图片

### 2. 测试主题
- 切换不同主题查看效果
- 尝试 Unsplash 图片搜索
- 测试不同的字体和配色

## 📝 下一步

- [配置 Supabase](./SUPABASE_SETUP.md) - 启用完整功能
- [了解组件结构](./COMPONENTS.md) - 开始开发
- [添加 AI 功能](./AI_INTEGRATION.md) - 集成 AI 服务

## ❓ 常见问题

**Q: 不配置 Supabase 能用吗？**
A: 可以使用基础的封面创建功能，但无法保存用户数据和使用 AI 功能。

**Q: 端口被占用怎么办？**
A: 修改 `package.json` 中的 start 脚本，指定其他端口：
```json
"start": "PORT=3001 react-scripts start"
```

**Q: 如何切换到不同的开发环境？**
A: 修改 `.env.local` 文件中的配置即可。