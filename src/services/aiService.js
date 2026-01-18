import { supabase } from '../supabaseClient';
// src/services/aiService.js
class AIService {
  constructor() {
    // 默认模型配置（可通过环境变量覆盖）
    this.models = {
      title: process.env.REACT_APP_AI_TITLE_MODEL || 'anthropic/claude-3-haiku',
      color: process.env.REACT_APP_AI_COLOR_MODEL || 'anthropic/claude-3-haiku',
      icon: process.env.REACT_APP_AI_ICON_MODEL || 'anthropic/claude-3-haiku',
      image: process.env.REACT_APP_AI_IMAGE_MODEL || 'pollinations/flux'
    };
  }

  // AI Title Optimization
  async optimizeTitle(title, style = 'professional') {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-title', {
        body: { title, style }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || 'Optimization service temporarily unavailable');
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

  // Get current configuration info
  getConfig() {
    return {
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

  // AI Image Generation (Via Supabase Edge Function)
  async generateImage(prompt, style = 'realistic') {
    try {
      console.log('Invoking generate-image function...');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Please login first to use this feature');
      }

      // Supabase invoke will automatically use the current session's Authorization header
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || 'Generation service temporarily unavailable');
      }

      if (data.error) {
        console.error('Generation Error:', data.error);
        throw new Error(data.error); // e.g. "Free quota reached"
      }

      return {
        url: data.url, // Base64 Data URI
        remoteUrl: '',
        prompt: prompt,
        style: style,
        model: 'flux', // Default from edge function
        provider: 'CoverView AI',
        cost: 10
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw error; // Propagate error to UI
    }
  }

  // Get Pollinations Image Styles
  getImageStyles() {
    return [
      { id: 'realistic', name: 'Realistic', description: 'Photo-realistic effect' },
      { id: 'artistic', name: 'Artistic', description: 'Artistic painting effect' },
      { id: 'anime', name: 'Anime', description: 'Japanese anime style' },
      { id: 'fantasy', name: 'Fantasy', description: 'Magical fantasy effect' },
      { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic sci-fi style' },
      { id: 'minimalist', name: 'Minimalist', description: 'Clean modern design' }
    ];
  }

  // Get Pollinations Models
  getPollinationsModels() {
    return [
      {
        id: 'flux',
        name: 'Flux',
        description: 'Latest high-quality general model, recommended',
        quality: 'excellent',
        speed: 'medium'
      },
      {
        id: 'sdxl',
        name: 'Stable Diffusion XL',
        description: 'Classic open-source model, stable quality',
        quality: 'very-good',
        speed: 'slow'
      },
      {
        id: 'kandinsky',
        name: 'Kandinsky',
        description: 'Innovative model from Russia',
        quality: 'good',
        speed: 'medium'
      },
      {
        id: 'openjourney',
        name: 'OpenJourney',
        description: 'Open source Journey style model',
        quality: 'good',
        speed: 'fast'
      },
      {
        id: 'anything',
        name: 'Anything',
        description: 'Anime focused model, 2D style',
        quality: 'excellent',
        speed: 'medium'
      },
      {
        id: 'realistic-vision',
        name: 'Realistic Vision',
        description: 'Realistic style focused model',
        quality: 'excellent',
        speed: 'slow'
      }
    ];
  }

  // Generate image prompt from blog title
  generateImagePrompt(title, style = 'realistic') {
    const stylePrompts = {
      realistic: 'photorealistic, professional blog cover, clean design',
      artistic: 'digital art, creative blog cover, artistic illustration',
      anime: 'anime style, manga blog cover, colorful illustration',
      fantasy: 'fantasy art, magical blog cover, ethereal design',
      cyberpunk: 'cyberpunk aesthetic, tech blog cover, futuristic design',
      minimalist: 'minimalist design, clean blog cover, simple layout'
    };

    // Extract keywords
    const keywords = this.extractKeywords(title);

    // Build base prompt
    let prompt = keywords.length > 0
      ? keywords.join(', ') + ', ' + stylePrompts[style]
      : `technology blog cover, ${stylePrompts[style]}`;

    // Add tech related elements
    const techElements = ['code', 'circuits', 'data visualization', 'abstract tech patterns'];
    const randomElement = techElements[Math.floor(Math.random() * techElements.length)];

    prompt += `, ${randomElement}`;

    return prompt;
  }

  // Extract keywords from title
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
}

// 创建单例实例
const aiService = new AIService();

export default aiService;