# 部署指南

## 🌐 生产环境部署

### Vercel 部署 (推荐)

#### 1. 准备项目
```bash
# 确保项目结构完整
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 导入 CoverView 项目
4. Vercel 会自动检测为 React 项目

#### 3. 环境变量配置
在 Vercel Dashboard 中设置环境变量：

```
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-production-key
VITE_OPENAI_API_KEY=your-openai-key
```

#### 4. 部署配置文件
创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "cache-control": "s-maxage=31536000,immutable" },
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Netlify 部署

#### 1. 构建配置
创建 `netlify.toml`：

```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NODE_ENV = "production"

[context.deploy-preview.environment]
  NODE_ENV = "development"
```

#### 2. 重定向规则
创建 `public/_redirects`：

```
/*    /index.html   200
```

### GitHub Pages 部署

#### 1. 修改 package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "homepage": "https://username.github.io/CoverView"
}
```

#### 2. 安装 gh-pages
```bash
npm install --save-dev gh-pages
```

#### 3. 更新路由配置
由于 GitHub Pages 是单页面应用，需要处理路由：

```javascript
// src/utils/github-pages-setup.js
export const setupGitHubPages = () => {
  if (window.location.hostname === 'username.github.io') {
    // 处理 GitHub Pages 路由
    const path = window.location.pathname.replace(/\/CoverView\/?/, '');
    if (path && path !== '/') {
      window.history.replaceState({}, '', path);
    }
  }
};
```

## 🔧 环境配置

### 开发环境 (.env.development)
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_dev_key
VITE_OPENAI_API_KEY=sk_dev_key
```

### 生产环境 (.env.production)
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_prod_key
VITE_OPENAI_API_KEY=sk_prod_key
```

### CI/CD 环境变量

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🛡️ 安全配置

### Supabase 生产环境配置

#### 1. 行级安全策略 (RLS)
确保所有表都有适当的 RLS 策略：

```sql
-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_usage  
  FOR UPDATE USING (auth.uid() = user_id);
```

#### 2. API 密钥轮换
```javascript
// 定期轮换 API 密钥的脚本
const rotateApiKeys = async () => {
  // 生成新的密钥
  const newKey = await generateNewApiKey();
  
  // 更新环境变量
  await updateEnvironmentVariable('OPENAI_API_KEY', newKey);
  
  // 记录轮换日志
  await logKeyRotation('OPENAI_API_KEY', new Date());
};
```

### 域名和 HTTPS

#### 自定义域名配置
```javascript
// public/manifest.json
{
  "name": "CoverView",
  "short_name": "CoverView",
  "start_url": "https://yourdomain.com/",
  "display": "standalone",
  "background_color": "#ffffff"
}
```

#### 安全头部设置
```javascript
// vercel.json (添加安全头部)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 📊 监控和分析

### 性能监控

#### 1. Vercel Analytics
```javascript
// 自定义事件追踪
import { analytics } from '@vercel/analytics/react';

const trackAIUsage = (type, success) => {
  analytics.track('AI Usage', {
    type: type,
    success: success,
    timestamp: new Date().toISOString()
  });
};
```

#### 2. 错误监控
```javascript
// src/utils/errorTracking.js
const trackError = (error, context) => {
  console.error('Application Error:', error);
  
  // 发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        context: context,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    });
  }
};
```

### 使用量统计

#### Supabase 统计查询
```sql
-- 创建使用量统计视图
CREATE VIEW monthly_usage_stats AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as active_users,
  SUM(ai_optimizations) as total_ai_optimizations,
  SUM(image_generations) as total_image_generations,
  SUM(color_recommendations) as total_color_recommendations
FROM user_usage 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

## 🔄 持续集成/部署

### 自动化部署流程

#### 1. 预提交检查
```json
// package.json
{
  "scripts": {
    "precommit": "npm run lint && npm run test && npm run build",
    "lint": "eslint src/",
    "test": "react-scripts test --coverage --watchAll=false",
    "build": "react-scripts build"
  }
}
```

#### 2. 部署前检查清单
```yaml
# .github/workflows/pre-deploy.yml
name: Pre-deploy checks

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### 版本管理

#### 语义化版本
```json
{
  "version": "1.0.0",
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor", 
    "version:major": "npm version major",
    "release": "npm run build && npm run deploy"
  }
}
```

#### 部署标签
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 🚀 回滚策略

### 快速回滚
```bash
# Vercel 回滚到上一个部署
vercel rollback

# Git 回滚
git revert HEAD
git push origin main
```

### 蓝绿部署
```javascript
// 实现功能开关
const FEATURES = {
  AI_IMAGE_GENERATION: process.env.REACT_APP_ENABLE_AI_IMAGES === 'true',
  NEW_THEME_SYSTEM: process.env.REACT_APP_ENABLE_NEW_THEMES === 'true'
};

const isFeatureEnabled = (feature) => {
  return FEATURES[feature] || false;
};
```

## 📋 部署检查清单

### 部署前检查
- [ ] 所有环境变量已设置
- [ ] Supabase RLS 策略正确配置
- [ ] API 密钥有效且有足够额度
- [ ] SSL 证书配置正确
- [ ] 域名 DNS 配置完成
- [ ] 性能测试通过
- [ ] 错误监控已启用
- [ ] 备份策略已制定

### 部署后验证
- [ ] 网站可正常访问
- [ ] 用户注册/登录功能正常
- [ ] AI 功能响应正常
- [ ] 使用量统计正确
- [ ] 移动端显示正常
- [ ] SEO meta 标签正确
- [ ] 加载速度符合预期

这个部署指南涵盖了从开发到生产的完整流程，确保应用安全、稳定地运行在生产环境中。