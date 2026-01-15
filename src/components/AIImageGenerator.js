import React, { useState, useContext, useEffect } from 'react';
import aiService from '../services/aiService';
import imageHistoryService from '../services/imageHistoryService';
import { ImgContext } from '../utils/ImgContext';

const AIImageGenerator = ({
  title,
  onImageGenerated,
  onClose,
  remainingQuota,
  onUseQuota
}) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [model, setModel] = useState('flux');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const { setUnsplashImage } = useContext(ImgContext);

  const styles = aiService.getImageStyles();
  const models = aiService.getPollinationsModels();

  React.useEffect(() => {
    // 根据标题自动生成提示词
    if (title) {
      const autoPrompt = aiService.generateImagePrompt(title, style);
      setPrompt(autoPrompt);
    }
  }, [title, style]);

  useEffect(() => {
    if (activeTab === 'history') {
      setHistory(imageHistoryService.getHistory());
    }
  }, [activeTab]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入图像描述');
      return;
    }

    // 检查配额
    if (remainingQuota !== undefined && remainingQuota <= 0) {
      setError('AI 图片生成次数已用完，请升级到 Pro 版本');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.generateImage(prompt, style);
      setGeneratedImage(result);

      // 保存到历史记录
      imageHistoryService.saveImage(result);

      // 使用配额
      if (onUseQuota) {
        const success = await onUseQuota('imageGenerations');
        if (!success) {
          setError('配额不足，请升级到 Pro 版本');
          return;
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = (imgToUse = generatedImage) => {
    if (!imgToUse) return;

    // 构造兼容 Unsplash 格式的数据对象，以便 BackgroundTheme 可以正常显示
    // 优先使用 remoteUrl，以防 blob url 失效
    const imgUrl = imgToUse.remoteUrl || imgToUse.url;

    const aiImageObj = {
      url: imgUrl,
      name: `AI generated (${imgToUse.model || 'zimage'})`,
      avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', // AI avatar placeholder
      profile: 'https://pollinations.ai',
      downloadLink: imgUrl,
      alt_description: imgToUse.prompt
    };

    setUnsplashImage(aiImageObj);

    // 调用父组件回调以关闭弹窗
    if (onImageGenerated) {
      onImageGenerated(imgToUse);
    }
  };

  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
    // 重新生成提示词
    if (title) {
      const autoPrompt = aiService.generateImagePrompt(title, newStyle);
      setPrompt(autoPrompt);
    }
  };

  const handleModelChange = (newModel) => {
    setModel(newModel);
  };

  const renderGenerateTab = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择风格
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {styles.map((styleOption) => (
            <button
              key={styleOption.id}
              onClick={() => handleStyleChange(styleOption.id)}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${style === styleOption.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {styleOption.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {styles.find(s => s.id === style)?.description}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          图像描述
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图像..."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 基于你的标题自动生成，可以手动修改
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : !prompt.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </span>
        ) : (
          '🚀 生成图片'
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {generatedImage && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">生成结果</h4>
          <div className="relative">
            <img
              src={generatedImage.url}
              alt={generatedImage.prompt}
              className="w-full rounded-lg shadow-md"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {generatedImage.width} × {generatedImage.height}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleUseImage(generatedImage)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              ✓ 使用此图片
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              🔄 重新生成
            </button>
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p><strong>提示词:</strong> {generatedImage.prompt}</p>
            <p className="truncate"><strong>URL:</strong> {generatedImage.remoteUrl || generatedImage.url}</p>
          </div>
        </div>
      )}
    </>
  );

  const renderHistoryTab = () => (
    <div className="h-[400px] overflow-y-auto">
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">暂无生成历史</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {history.map((item) => (
            <div key={item.id} className="group relative border rounded-lg overflow-hidden bg-gray-50 flex flex-col">
              <div className="aspect-[2/1] w-full overflow-hidden bg-gray-200 relative">
                <img
                  src={item.remoteUrl || item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleUseImage(item)}
                    className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg transform hover:scale-105 transition-all"
                  >
                    使用
                  </button>
                </div>
              </div>
              <div className="p-2 text-xs text-gray-600 flex-1 flex flex-col justify-between">
                <p className="line-clamp-2 mb-1" title={item.prompt}>{item.prompt}</p>
                <div className="flex justify-between items-center text-gray-400 text-[10px]">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  <span>{item.style}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="ai-image-generator bg-white rounded-lg shadow-lg p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎨 AI 图片生成
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b mb-4">
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'generate' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('generate')}
        >
          生成图片
          {activeTab === 'generate' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
          )}
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('history')}
        >
          历史记录
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'generate' ? renderGenerateTab() : renderHistoryTab()}
    </div>
  );
};

export default AIImageGenerator;