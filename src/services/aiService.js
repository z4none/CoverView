import { supabase } from '../supabaseClient';
// src/services/aiService.js
class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';

    // 默认模型配置（可通过环境变量覆盖）
    this.models = {
      title: process.env.REACT_APP_AI_TITLE_MODEL || 'anthropic/claude-3-haiku',
      color: process.env.REACT_APP_AI_COLOR_MODEL || 'anthropic/claude-3-haiku',
      icon: process.env.REACT_APP_AI_ICON_MODEL || 'anthropic/claude-3-haiku',
      image: process.env.REACT_APP_AI_IMAGE_MODEL || 'pollinations/flux'
    };
  }

  // 检查 API Key 是否配置
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'sk-or-v1-your-openrouter-key-here';
  }

  // AI 标题优化
  async optimizeTitle(title, style = 'professional') {
    // 移除了 isConfigured 检查，因为现在配置在服务端
    // if (!this.isConfigured()) { ... }

    try {
      const { data, error } = await supabase.functions.invoke('optimize-title', {
        body: { title, style }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || '优化服务暂时不可用');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.suggestions || [];
    } catch (error) {
      console.error('AI title optimization error:', error);
      throw error;
    }
  }

  // 获取当前配置信息
  getConfig() {
    return {
      configured: this.isConfigured(),
      models: this.models,
      availableModels: [
        'anthropic/claude-3-haiku',
        'anthropic/claude-3-sonnet',
        'anthropic/claude-3-opus',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'openai/gpt-3.5-turbo',
        'google/gemini-flash',
        'google/gemini-pro',
        'meta-llama/llama-3.1-70b-instruct',
        'meta-llama/llama-3.1-8b-instruct',
        'mistralai/mistral-7b-instruct'
      ],
      pollinationsModels: this.getPollinationsModels()
    };
  }

  // 获取可用的模型列表（用于调试）
  async getModels() {
    if (!this.isConfigured()) return [];

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
    return [];
  }

  // AI 图像生成 (Via Supabase Edge Function)
  async generateImage(prompt, style = 'realistic') {
    try {
      console.log('Invoking generate-image function...');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('请先登录使用此功能');
      }

      // Supabase invoke 会自动使用当前 session 的 Authorization header
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || '生成服务暂时不可用');
      }

      if (data.error) {
        console.error('Generation Error:', data.error);
        throw new Error(data.error); // 例如 "已达到免费额度"
      }

      return {
        url: data.url, // Base64 Data URI
        remoteUrl: '',
        prompt: prompt,
        style: style,
        model: 'flux', // Default from edge function
        provider: 'CoverView AI',
        cost: 1
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw error; // Propagate error to UI
    }
  }

  // 获取 Pollinations 图像风格
  getImageStyles() {
    return [
      { id: 'realistic', name: '写实风格', description: '逼真的照片效果' },
      { id: 'artistic', name: '艺术风格', description: '艺术绘画效果' },
      { id: 'anime', name: '动漫风格', description: '日式动漫风格' },
      { id: 'fantasy', name: '幻想风格', description: '奇幻魔法效果' },
      { id: 'cyberpunk', name: '赛博朋克', description: '未来科技感' },
      { id: 'minimalist', name: '极简风格', description: '简洁现代设计' }
    ];
  }

  // 获取 Pollinations 模型
  getPollinationsModels() {
    return [
      {
        id: 'flux',
        name: 'Flux',
        description: '最新高质量通用模型，推荐使用',
        quality: 'excellent',
        speed: 'medium'
      },
      {
        id: 'sdxl',
        name: 'Stable Diffusion XL',
        description: '经典开源模型，质量稳定',
        quality: 'very-good',
        speed: 'slow'
      },
      {
        id: 'kandinsky',
        name: 'Kandinsky',
        description: '俄罗斯开发的创新模型',
        quality: 'good',
        speed: 'medium'
      },
      {
        id: 'openjourney',
        name: 'OpenJourney',
        description: '开源 Journey 风格模型',
        quality: 'good',
        speed: 'fast'
      },
      {
        id: 'anything',
        name: 'Anything',
        description: '动漫专用模型，二次元风格',
        quality: 'excellent',
        speed: 'medium'
      },
      {
        id: 'realistic-vision',
        name: 'Realistic Vision',
        description: '写实风格专用模型',
        quality: 'excellent',
        speed: 'slow'
      }
    ];
  }

  // 从博客标题生成图像提示词
  generateImagePrompt(title, style = 'realistic') {
    const stylePrompts = {
      realistic: 'photorealistic, professional blog cover, clean design',
      artistic: 'digital art, creative blog cover, artistic illustration',
      anime: 'anime style, manga blog cover, colorful illustration',
      fantasy: 'fantasy art, magical blog cover, ethereal design',
      cyberpunk: 'cyberpunk aesthetic, tech blog cover, futuristic design',
      minimalist: 'minimalist design, clean blog cover, simple layout'
    };

    // 提取关键词
    const keywords = this.extractKeywords(title);

    // 构建基础提示词
    let prompt = keywords.length > 0
      ? keywords.join(', ') + ', ' + stylePrompts[style]
      : `technology blog cover, ${stylePrompts[style]}`;

    // 添加技术相关元素
    const techElements = ['code', 'circuits', 'data visualization', 'abstract tech patterns'];
    const randomElement = techElements[Math.floor(Math.random() * techElements.length)];

    prompt += `, ${randomElement}`;

    return prompt;
  }

  // 从标题提取关键词
  extractKeywords(title) {
    const techKeywords = [
      'javascript', 'react', 'vue', 'angular', 'nodejs', 'python', 'django', 'flask',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql',
      'machine learning', 'ai', 'artificial intelligence', 'data science', 'web development',
      'frontend', 'backend', 'fullstack', 'api', 'database', 'cloud', 'devops'
    ];

    const lowercaseTitle = title.toLowerCase();
    const foundKeywords = [];

    techKeywords.forEach(keyword => {
      if (lowercaseTitle.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords.length > 0 ? foundKeywords : ['technology', 'programming'];
  }

  // 测试模型连接
  async testModel(modelName) {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CoverView - Model Test'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: '请回复"测试成功"'
            }
          ],
          max_tokens: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Model ${modelName} test failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.choices?.[0]?.message?.content || '',
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 创建单例实例
const aiService = new AIService();

export default aiService;