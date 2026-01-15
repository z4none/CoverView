# AI 功能集成指南

## 🤖 AI 功能规划

### Phase 1: 基础 AI 功能 (高优先级)

#### 1. AI 标题优化 ⭐⭐⭐⭐⭐
- **功能**: 优化博客标题，提供多种风格选择
- **模型**: GPT-3.5-turbo (成本低，速度快)
- **成本**: ~$0.002/次
- **配额**: 免费用户 10 次/月

#### 2. 智能配色推荐 ⭐⭐⭐⭐
- **功能**: 根据标题内容推荐配色方案
- **实现**: 预设方案 + AI 匹配算法
- **成本**: ~$0.0001/次
- **配额**: 免费用户 20 次/月

### Phase 2: 高级 AI 功能

#### 3. AI 图标推荐 ⭐⭐⭐⭐
- **功能**: 根据标题智能推荐技术图标
- **技术**: NLP + 语义匹配
- **成本**: ~$0.001/次
- **配额**: 免费用户 15 次/月

#### 4. 批量生成方案 ⭐⭐⭐⭐
- **功能**: 一键生成多个不同风格的封面
- **技术**: 组合多个 AI 服务
- **成本**: ~$0.01/次 (包含多个子服务)
- **配额**: 免费用户 5 次/月

### Phase 3: 高级功能 (可选)

#### 5. AI 背景图生成 ⭐⭐⭐
- **功能**: 根据标题生成匹配的背景图片
- **模型**: DALL-E 3 或 Stable Diffusion
- **成本**: ~$0.04/次 (DALL-E) 或 ~$0.002/次 (SD)
- **配额**: 免费用户 3 次/月

## 🛠️ 技术实现

### AI 服务集成架构

```javascript
// src/services/aiService.js
class AIService {
  constructor() {
    this.openaiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.replicateToken = process.env.REACT_APP_REPLICATE_TOKEN;
  }

  // AI 标题优化
  async optimizeTitle(title, style = 'professional') {
    const prompts = {
      professional: `将以下博客标题优化得更专业、更有吸引力："${title}"`,
      catchy: `将以下博客标题优化得更吸引眼球、更具病毒传播性："${title}"`,
      simple: `将以下博客标题简化，让读者更容易理解："${title}"`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompts[style]
        }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  // 智能配色推荐
  async recommendColors(title) {
    // 简化实现：使用关键词匹配预设方案
    const keywordColorMap = {
      'javascript': ['#f7df1e', '#323330'],      // 黄色 + 深色
      'react': ['#61dafb', '#282c34'],          // 蓝色 + 深色
      'python': ['#3776ab', '#ffd43b'],         // 蓝色 + 黄色
      'design': ['#ff6b6b', '#4ecdc4'],         // 珊瑚色 + 青色
      'tutorial': ['#6c5ce7', '#00b894'],       // 紫色 + 绿色
    };

    const lowercaseTitle = title.toLowerCase();
    for (const [keyword, colors] of Object.entries(keywordColorMap)) {
      if (lowercaseTitle.includes(keyword)) {
        return colors;
      }
    }

    // 默认配色
    return ['#667eea', '#764ba2'];
  }

  // AI 图标推荐
  async recommendIcon(title) {
    // 提取技术关键词
    const techKeywords = [
      'javascript', 'react', 'vue', 'angular', 'nodejs',
      'python', 'django', 'flask', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'mongodb', 'postgresql'
    ];

    const lowercaseTitle = title.toLowerCase();
    for (const keyword of techKeywords) {
      if (lowercaseTitle.includes(keyword)) {
        return { label: keyword, value: keyword };
      }
    }

    return { label: 'default', value: 'default' };
  }
}

export default new AIService();
```

### 在编辑器中集成 AI 功能

```javascript
// src/components/Editor.js (扩展)
import AIService from '../services/aiService';
import { useUsageTracker } from '../hooks/useUsageTracker';

const Editor = () => {
  const { incrementUsage, canUse, remainingQuota } = useUsageTracker();
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);

  // AI 标题优化
  const handleOptimizeTitle = async () => {
    if (!canUse('aiOptimizations')) {
      alert('AI 优化次数已用完，请升级到 Pro 版本');
      return;
    }

    setIsAILoading(true);
    try {
      const optimized = await AIService.optimizeTitle(state.title);
      setAiSuggestions([optimized]);
      const success = await incrementUsage('aiOptimizations');
      if (success) {
        // 使用优化后的标题
        setState({ ...state, title: optimized });
      }
    } catch (error) {
      console.error('AI 优化失败:', error);
      alert('AI 优化失败，请稍后重试');
    } finally {
      setIsAILoading(false);
    }
  };

  // AI 配色推荐
  const handleRecommendColors = async () => {
    if (!canUse('colorRecommendations')) {
      alert('配色推荐次数已用完，请升级到 Pro 版本');
      return;
    }

    try {
      const colors = await AIService.recommendColors(state.title);
      setState({ ...state, bgColor: colors[0] });
      await incrementUsage('colorRecommendations');
    } catch (error) {
      console.error('配色推荐失败:', error);
    }
  };

  // AI 图标推荐
  const handleRecommendIcon = async () => {
    if (!canUse('aiOptimizations')) {
      alert('图标推荐次数已用完，请升级到 Pro 版本');
      return;
    }

    try {
      const icon = await AIService.recommendIcon(state.title);
      setState({ ...state, icon });
      await incrementUsage('aiOptimizations');
    } catch (error) {
      console.error('图标推荐失败:', error);
    }
  };

  return (
    <div className="editor">
      {/* AI 功能按钮组 */}
      <div className="ai-controls mb-4">
        <button 
          onClick={handleOptimizeTitle}
          disabled={isAILoading || !canUse('aiOptimizations')}
          className="ai-button bg-indigo-600 text-white px-4 py-2 rounded mr-2"
        >
          {isAILoading ? 'AI 优化中...' : '🤖 AI 优化标题'}
        </button>
        
        <button 
          onClick={handleRecommendColors}
          disabled={!canUse('colorRecommendations')}
          className="ai-button bg-purple-600 text-white px-4 py-2 rounded mr-2"
        >
          🎨 AI 配色推荐
        </button>
        
        <button 
          onClick={handleRecommendIcon}
          disabled={!canUse('aiOptimizations')}
          className="ai-button bg-green-600 text-white px-4 py-2 rounded"
        >
          💡 AI 图标推荐
        </button>
      </div>

      {/* 剩余配额显示 */}
      <div className="quota-info text-sm text-gray-600 mb-4">
        剩余 AI 优化: {remainingQuota.aiOptimizations} | 
        配色推荐: {remainingQuota.colorRecommendations}
      </div>

      {/* 原有编辑器内容 */}
      {/* ... */}
    </div>
  );
};
```

## 🎛️ AI 功能 UI 组件

### AI 建议组件

```jsx
// src/components/AISuggestions.js
import React from 'react';

const AISuggestions = ({ suggestions, onSelectSuggestion, loading }) => {
  if (loading) {
    return (
      <div className="ai-suggestions-loading">
        <div className="animate-pulse bg-gray-200 h-10 rounded mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
      </div>
    );
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="ai-suggestions mt-4">
      <h3 className="text-lg font-semibold mb-2">AI 建议的标题：</h3>
      {suggestions.map((suggestion, index) => (
        <div 
          key={index}
          onClick={() => onSelectSuggestion(suggestion)}
          className="ai-suggestion-item bg-gray-50 hover:bg-gray-100 p-3 rounded mb-2 cursor-pointer border border-gray-200"
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
};

export default AISuggestions;
```

## 🔧 环境配置

### 环境变量更新

```env
# .env.local
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_your-key-here

# AI 服务配置
VITE_OPENAI_API_KEY=sk-your-openai-key-here
VITE_REPLICATE_API_TOKEN=r8_your-replicate-token-here
VITE_STABILITY_API_KEY=your-stability-key-here
```

### 服务端配置 (可选)

对于更安全的生产环境，可以创建后端 API：

```javascript
// functions/ai-api.js (Vercel Functions)
const AIService = require('../services/aiService');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;
  
  try {
    switch (type) {
      case 'optimize-title':
        const result = await AIService.optimizeTitle(data.title, data.style);
        return res.json({ success: true, result });
      default:
        return res.status(400).json({ error: 'Invalid AI service type' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

## 📊 成本控制策略

### 配额管理
```javascript
// 前端配额检查
const checkQuota = (type) => {
  const quotas = {
    aiOptimizations: 10,
    colorRecommendations: 20,
    imageGenerations: 3
  };
  
  return remainingQuota[type] > 0;
};

// 智能缓存
const useCache = (key, fetcher) => {
  const [cached, setCached] = useState(localStorage.getItem(key));
  
  if (cached) {
    return Promise.resolve(JSON.parse(cached));
  }
  
  return fetcher().then(result => {
    localStorage.setItem(key, JSON.stringify(result));
    return result;
  });
};
```

### 成本监控
```javascript
// 成本追踪
const costTracker = {
  optimizeTitle: 0.002,    // $0.002 per request
  recommendColors: 0.0001,  // $0.0001 per request
  generateImage: 0.04,     // $0.04 per request (DALL-E)
};

const trackCost = (type, userId) => {
  const cost = costTracker[type] || 0;
  // 记录到数据库或分析服务
  console.log(`User ${userId} used ${type}, cost: $${cost}`);
};
```

## 🚀 实施步骤

### Week 1: 基础 AI 功能
1. 设置 OpenAI API 集成
2. 实现标题优化功能
3. 添加配额管理
4. 创建 AI UI 组件

### Week 2: 智能配色
1. 实现配色推荐算法
2. 集成关键词匹配
3. 添加更多预设方案
4. 优化用户体验

### Week 3: 高级功能
1. 图标推荐系统
2. 批量生成功能
3. 性能优化
4. 错误处理改进

### Week 4: 可选功能
1. AI 背景图生成
2. 更多 AI 模型集成
3. 高级付费功能
4. 数据分析和优化

这个方案提供了一个完整的 AI 功能集成路径，从简单的文本优化到复杂的图像生成，可以根据用户反馈和预算逐步实施。