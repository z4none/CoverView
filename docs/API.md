# API 文档

## 📡 API 接口说明

### 认证 API (Supabase)

#### 登录
```javascript
import { supabase } from '../supabaseClient';

// GitHub OAuth 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/editor`
  }
});

// 退出登录
const { error } = await supabase.auth.signOut();
```

#### 获取用户信息
```javascript
// 获取当前会话
const { data: { session }, error } = await supabase.auth.getSession();

// 监听认证状态变化
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth state changed:', event, session);
  }
);
```

### 使用量追踪 API

#### 获取使用量
```javascript
// 从 user_usage 表获取用户使用量
const { data, error } = await supabase
  .from('user_usage')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

#### 更新使用量
```javascript
// 增加使用次数
const { data, error } = await supabase
  .from('user_usage')
  .update({
    ai_optimizations: currentCount + 1,
    total_usage: totalUsage + 1
  })
  .eq('user_id', user.id);
```

### AI 服务 API (即将集成)

#### OpenAI API
```javascript
// AI 标题优化
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: `优化这个博客标题: "${title}"`
    }]
  })
});
```

#### DALL-E 3 API
```javascript
// AI 图片生成
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1024x1024'
  })
});
```

### Unsplash API

#### 搜索图片
```javascript
// 使用 unsplash-js 搜索图片
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.REACT_APP_UNSPLASH_ACCESS_KEY
});

const result = await unsplash.search.getPhotos({
  query: searchTerm,
  page: 1,
  perPage: 10
});
```

## 🔧 自定义 Hooks

### useAuth Hook
```javascript
import { useAuth } from '../contexts/AuthContext';

const { user, session, loading, signOut } = useAuth();

// user: 用户信息对象
// session: 会话信息
// loading: 加载状态
// signOut: 退出登录函数
```

### useUsageTracker Hook
```javascript
import { useUsageTracker } from '../hooks/useUsageTracker';

const { 
  usage,           // 当前使用量
  loading,         // 加载状态
  incrementUsage,  // 增加使用量
  remainingQuota,  // 剩余配额
  FREE_QUOTA,      // 免费配额限制
  canUse          // 检查是否可以使用功能
} = useUsageTracker();

// 使用示例
if (canUse('aiOptimizations')) {
  const success = await incrementUsage('aiOptimizations');
  if (success) {
    // 执行 AI 优化
  }
}
```

## 📊 数据库结构

### user_usage 表
```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ai_optimizations INTEGER DEFAULT 0,
  image_generations INTEGER DEFAULT 0,
  color_recommendations INTEGER DEFAULT 0,
  total_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_subscriptions 表
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP DEFAULT NOW(),
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 安全最佳实践

### API 密钥管理
```javascript
// ✅ 正确：使用环境变量
const apiKey = process.env.REACT_APP_API_KEY;

// ❌ 错误：硬编码密钥
const apiKey = 'sk-1234567890abcdef';
```

### 请求验证
```javascript
// 在执行敏感操作前验证用户身份
const validateSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!session || error) {
    throw new Error('Invalid session');
  }
  return session;
};
```

### 错误处理
```javascript
const safeApiCall = async (apiFunction) => {
  try {
    const result = await apiFunction();
    return { data: result, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error };
  }
};
```