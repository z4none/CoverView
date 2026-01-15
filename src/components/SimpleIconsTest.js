import React, { useState, useEffect } from 'react';

const SimpleIconsTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testSimpleIconsAPI = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          'https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        
        // 分析数据结构
        const analysis = {
          total: jsonData.icons?.length || 0,
          hasIcons: !!jsonData.icons,
          sample: jsonData.icons?.slice(0, 5) || [],
          categories: [...new Set(jsonData.icons?.map(icon => icon.category))].slice(0, 10)
        };
        
        setData(analysis);
        setError(null);
        
        console.log('✅ SimpleIcons API 测试成功');
        console.log('📊 数据分析:', analysis);
        
      } catch (err) {
        console.error('❌ SimpleIcons API 测试失败:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testSimpleIconsAPI();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">测试 SimpleIcons API...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ API 测试失败</h3>
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          请检查网络连接或 URL 是否正确
        </p>
        <pre className="mt-4 p-4 bg-red-100 rounded text-xs overflow-auto">
          URL: https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json
        </pre>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">✅ SimpleIcons 集成测试成功</h3>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">📊 数据统计</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">总图标数量</span>
              <div className="text-2xl font-bold text-blue-600">{data.total}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">分类数量</span>
              <div className="text-2xl font-bold text-green-600">{data.categories.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">🎨 示例图标</h4>
          <div className="grid grid-cols-5 gap-3">
            {data.sample.map((icon) => (
              <div key={icon.title} className="flex flex-col items-center p-2 border rounded-lg">
                <img 
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${icon.title.toLowerCase().replace(/\s+/g, '-')}.svg`}
                  alt={icon.title}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-xs text-center mt-1 truncate w-full">{icon.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">📂 图标分类</h4>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <span 
                key={category}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">🔗 API 信息</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
              https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json
            </code></p>
            <p><strong>状态:</strong> <span className="text-green-600">✓ 正常运行</span></p>
            <p><strong>CDN:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/
            </code></p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📋 下一步</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ SimpleIcons 已成功集成到 Editor 组件</li>
          <li>✅ 增强的图标选择器已创建</li>
          <li>✅ 支持搜索、分类过滤功能</li>
          <li>⏭ 可以开始在 Editor 中测试图标选择</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleIconsTest;