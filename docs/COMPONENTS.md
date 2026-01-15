# React 组件文档

## 🧩 组件架构概览

### 核心组件结构

```
src/components/
├── App.js                    # 主应用组件，路由管理
├── Home.js                   # 首页展示组件
├── Editor.js                 # 编辑器主组件
├── Header.js                 # 头部导航
├── FAQ.js                    # 常见问题页面
├── GitHubAuthButton.js      # GitHub 登录按钮
├── ProtectedRoute.js        # 路由保护组件
├── UsageDisplay.js          # 使用量显示组件
├── CoverImage.js            # 封面图片组件
├── ComponentToImg.js        # 图片导出组件
├── UnsplashSearch.js        # 图片搜索组件
├── RandomTheme.js           # 随机主题组件
├── walloflove.js            # 用户展示墙
└── Themes/                   # 主题组件目录
    ├── BackgroundTheme.js
    ├── ModernTheme.js
    ├── StylishTheme.js
    ├── PreviewTheme.js
    ├── OutlineTheme.js
    ├── MobileMockupTheme.js
    └── BasicTheme.js
```

## 🏠 主要组件说明

### App.js
**功能**: 应用的根组件，管理路由和认证状态

```jsx
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Home.js
**功能**: 首页展示，包含产品介绍和登录入口

**Props**: 无

**状态管理**:
- 使用 `useAuth()` 检查登录状态
- 已登录用户自动跳转到 `/editor`

**主要功能**:
- 产品特性展示
- GitHub 登录按钮
- 响应式设计

### Editor.js
**功能**: 核心编辑器组件，封面图片创建

**状态**:
```javascript
state = {
  title: "A beginners guide to frontend development",
  bgColor: "#949ee5",
  pattern: "",
  download: "PNG",
  author: 'Rutik Wankhade',
  icon: defaultIcon,
  devIconOptions: [defaultIcon],
  font: 'font-Anek',
  theme: 'background',
  customIcon: '',
  platform: 'hashnode'
}
```

**主要方法**:
- `handleReset()`: 重置为默认设置
- `getRandomTheme()`: 获取随机主题
- `handleDownload()`: 下载封面图片

### GitHubAuthButton.js
**功能**: GitHub OAuth 登录按钮

**Props**: 无

**依赖**: `useAuth()`, `supabaseClient`

```jsx
const handleGitHubSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/editor`
    }
  });
};
```

### ProtectedRoute.js
**功能**: 路由保护组件，未登录用户重定向到首页

**Props**:
- `children`: React 子组件

**逻辑**:
```jsx
if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/" replace />;
return children;
```

## 🎨 主题组件

### 主题基类结构
所有主题组件都接收相同的 props：

```jsx
const ThemeComponent = ({ 
  title,           // 博客标题
  author,          // 作者名
  bgColor,        // 背景颜色
  icon,           // 技术图标
  font,           // 字体类名
  pattern,        // 背景图案
  platform        // 平台类型
}) => {
  // 主题特定的渲染逻辑
};
```

### 可用主题

1. **BackgroundTheme** - 简洁背景主题
2. **ModernTheme** - 现代设计主题
3. **StylishTheme** - 时尚风格主题
4. **PreviewTheme** - 预览展示主题
5. **OutlineTheme** - 线框设计主题
6. **MobileMockupTheme** - 手机模型主题
7. **BasicTheme** - 基础简约主题

## 🔧 自定义 Hooks

### useAuth Hook
**文件**: `src/contexts/AuthContext.js`

**返回值**:
```javascript
{
  user: User | null,      // 用户信息
  session: Session | null, // 会话信息
  loading: boolean,       // 加载状态
  signOut: Function       // 退出登录
}
```

### useUsageTracker Hook
**文件**: `src/hooks/useUsageTracker.js`

**返回值**:
```javascript
{
  usage: {               // 当前使用量
    aiOptimizations: number,
    imageGenerations: number,
    colorRecommendations: number,
    totalUsage: number
  },
  loading: boolean,
  incrementUsage: Function,  // 增加使用量
  remainingQuota: {         // 剩余配额
    aiOptimizations: number,
    imageGenerations: number,
    colorRecommendations: number
  },
  FREE_QUOTA: Object,    // 免费配额限制
  canUse: Function       // 检查是否可用
}
```

## 🎯 组件使用示例

### 在 Editor 中使用 UsageDisplay
```jsx
import UsageDisplay from './UsageDisplay';
import { useUsageTracker } from '../hooks/useUsageTracker';

const Editor = () => {
  const { remainingQuota, FREE_QUOTA } = useUsageTracker();
  
  return (
    <div>
      <UsageDisplay 
        remainingQuota={remainingQuota} 
        FREE_QUOTA={FREE_QUOTA} 
      />
      {/* 编辑器其他内容 */}
    </div>
  );
};
```

### 创建新主题组件
```jsx
import React from 'react';

const CustomTheme = ({ title, author, bgColor, icon, font, pattern, platform }) => {
  const containerStyle = {
    backgroundColor: bgColor,
    backgroundImage: pattern ? `url(${pattern})` : 'none',
  };

  return (
    <div style={containerStyle} className={`${font} p-8`}>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="flex items-center">
        <img src={`/icons/${icon.value}.svg`} alt={icon.label} />
        <span className="ml-2">{author}</span>
      </div>
    </div>
  );
};

export default CustomTheme;
```

## 📱 响应式设计

所有组件都使用 TailwindCSS 进行响应式设计：

```jsx
// 移动端优先的设计
<div className="w-full md:w-10/12 lg:w-8/12 mx-auto">
  <h1 className="text-2xl md:text-4xl lg:text-6xl">
    Title
  </h1>
</div>
```

## 🔄 组件通信

### 父子组件通信
```jsx
// 父组件传递状态
<CoverImage 
  title={state.title}
  author={state.author}
  bgColor={state.bgColor}
/>

// 子组件通过回调更新状态
<ThemeSelector 
  selectedTheme={state.theme}
  onThemeChange={(theme) => setState({ theme })}
/>
```

### Context 全局状态
```jsx
// 认证状态全局可用
const { user, signOut } = useAuth();

// 使用量状态全局可用
const { incrementUsage, canUse } = useUsageTracker();
```

## 🎨 样式约定

### TailwindCSS 类名规范
- 布局: `flex`, `grid`, `container`
- 间距: `p-4`, `m-2`, `gap-4`
- 颜色: `bg-gray-100`, `text-indigo-600`
- 响应式: `md:text-xl`, `lg:w-1/2`

### 自定义 CSS 文件
- `src/index.css` - 全局样式
- `src/components/CoverImage.css` - 封面图片特定样式
- `src/components/RandomTheme.css` - 随机主题样式
- `src/assets/css/patterns.css` - 背景图案样式