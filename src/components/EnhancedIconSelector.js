import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

// 简单的 AutoSizer 实现，避免库兼容性问题
const MyAutoSizer = ({ children }) => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const updateSize = () => {
      if (ref.current) {
        setSize({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {size.width > 0 && size.height > 0 && children(size)}
    </div>
  );
};

// Cache key for SimpleIcons

const CACHE_KEY = 'simpleicons_cache_v2';
const CACHE_EXPIRY_HOURS = 24; // 缓存24小时

const EnhancedIconSelector = ({ value, onChange, onClose }) => {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // 检查缓存是否过期
  const isCacheValid = (cacheData) => {
    if (!cacheData || !cacheData.timestamp) return false;
    const cacheTime = new Date(cacheData.timestamp);
    const now = new Date();
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    return hoursDiff < CACHE_EXPIRY_HOURS;
  };

  useEffect(() => {
    // 加载 SimpleIcons 图标
    const loadIcons = async () => {
      try {
        setLoading(true);

        // 尝试从缓存加载
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          if (isCacheValid(parsedCache)) {
            console.log('✅ 从缓存加载 SimpleIcons:', parsedCache.icons.length, '个图标');
            console.log('📅 缓存时间:', new Date(parsedCache.timestamp).toLocaleString());

            const allIcons = [
              { value: 'upload-your-own', label: 'Upload Your Own', source: 'custom', library: 'Custom', category: 'custom' },
              ...parsedCache.icons
            ];

            setDebugInfo({
              simpleIconsCount: parsedCache.icons.length,
              totalCount: allIcons.length,
              simpleIconsFormat: 'from cache',
              loadTime: new Date(parsedCache.timestamp).toLocaleTimeString()
            });

            setIcons(allIcons);
            setLoading(false);
            return;
          }
        }

        // 缓存无效或不存在，从网络加载
        console.log('🔄 从网络加载 SimpleIcons...');

        const simpleIconsResponse = await fetch(
          'https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json'
        );
        const simpleIconsData = await simpleIconsResponse.json();

        console.log('📊 SimpleIcons 数据结构:', Object.keys(simpleIconsData));
        console.log('📊 SimpleIcons.icons 是否存在:', !!simpleIconsData.icons);
        console.log('📊 SimpleIcons.icons 长度:', simpleIconsData.icons?.length || 0);

        // 处理 SimpleIcons
        let simpleIcons = [];

        if (simpleIconsData.icons && Array.isArray(simpleIconsData.icons)) {
          console.log('🎨 SimpleIcons 格式: data.icons 数组');
          simpleIcons = simpleIconsData.icons
            .filter(icon => icon.title)
            .map(icon => ({
              value: icon.title.toLowerCase().replace(/\s+/g, '-'),
              label: icon.title,
              source: 'simpleicons',
              library: 'Simple Icons',
              hex: icon.hex || '#666666',
              slug: icon.slug,
              category: getIconCategory(icon.title)
            }));
        } else if (Array.isArray(simpleIconsData)) {
          console.log('🎨 SimpleIcons 格式: 直接数组');
          simpleIcons = simpleIconsData
            .filter(item => item.title)
            .map(icon => ({
              value: icon.title.toLowerCase().replace(/\s+/g, '-'),
              label: icon.title,
              source: 'simpleicons',
              library: 'Simple Icons',
              hex: icon.hex || '#666666',
              slug: icon.slug,
              category: getIconCategory(icon.title)
            }));
        } else {
          console.error('❌ SimpleIcons 数据格式无法识别:', simpleIconsData);
        }

        console.log('✅ SimpleIcons 加载完成:', simpleIcons.length, '个图标');

        // 合并并添加自定义上传选项
        const allIcons = [
          { value: 'upload-your-own', label: 'Upload Your Own', source: 'custom', library: 'Custom', category: 'custom' },
          ...simpleIcons
        ];

        console.log('🎉 所有图标加载完成:', allIcons.length, '个图标');

        // 保存到缓存
        const cacheData = {
          icons: simpleIcons,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('💾 已缓存 SimpleIcons 数据');

        // 设置调试信息
        setDebugInfo({
          simpleIconsCount: simpleIcons.length,
          totalCount: allIcons.length,
          simpleIconsFormat: simpleIconsData.icons ? 'data.icons array' : Array.isArray(simpleIconsData) ? 'direct array' : 'unknown',
          loadTime: new Date().toLocaleTimeString()
        });

        setIcons(allIcons);
      } catch (error) {
        console.error('❌ 加载图标时出错:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, []);

  // 根据名称推断图标分类
  const getIconCategory = (name) => {
    const lowerName = name.toLowerCase();

    if (['javascript', 'python', 'typescript', 'java', 'go', 'rust', 'php', 'ruby'].includes(lowerName)) {
      return 'language';
    }
    if (['react', 'vue', 'angular', 'nextjs', 'nuxtjs', 'svelte'].includes(lowerName)) {
      return 'framework';
    }
    if (['mongodb', 'postgresql', 'mysql', 'redis', 'cassandra'].includes(lowerName)) {
      return 'database';
    }
    if (['aws', 'azure', 'google cloud', 'vercel', 'netlify'].includes(lowerName)) {
      return 'cloud';
    }
    if (['git', 'docker', 'kubernetes', 'vscode', 'github'].includes(lowerName)) {
      return 'tool';
    }

    return 'other';
  };

  // 过滤图标
  const filteredIcons = useMemo(() => {
    return icons.filter(icon => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return icon.label.toLowerCase().includes(term);
    });
  }, [icons, searchTerm]);

  // 渲染单个图标
  const renderIcon = (icon) => {
    if (icon.source === 'simpleicons') {
      const iconSlug = icon.slug || icon.value;
      return (
        <img
          src={`https://cdn.simpleicons.org/${iconSlug}`}
          alt={icon.label}
          className="w-12 h-12"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    } else {
      return (
        <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-xl text-white font-bold">
          {icon.label.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">加载图标中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">选择图标</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 搜索框 */}
          <input
            type="text"
            placeholder="搜索图标..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-4 mt-4 mb-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg transition-colors"
              title="显示调试信息"
            >
              🐛 调试
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(CACHE_KEY);
                console.log('🗑️ 已清除缓存');
                window.location.reload();
              }}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-sm rounded-lg transition-colors"
              title="清除缓存"
            >
              🗑️ 清除缓存
            </button>
          </div>

          {/* 调试面板 */}
          {showDebug && debugInfo && (
            <div className="mb-4 p-4 bg-gray-900 text-white rounded-lg">
              <h4 className="font-medium mb-3 flex items-center justify-between">
                <span>🐛 调试信息</span>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Simple Icons:</span>
                  <span className="text-blue-400 font-mono">{debugInfo.simpleIconsCount} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">总图标:</span>
                  <span className="text-yellow-400 font-mono">{debugInfo.totalCount} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">数据来源:</span>
                  <span className={`font-mono ${debugInfo.simpleIconsFormat === 'from cache' ? 'text-green-400' : 'text-purple-400'}`}>
                    {debugInfo.simpleIconsFormat === 'from cache' ? '📅 缓存' : '🌐 网络'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">数据格式:</span>
                  <span className="text-purple-400 font-mono">data.icons array</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">加载时间:</span>
                  <span className="text-gray-300 font-mono">{debugInfo.loadTime}</span>
                </div>
              </div>

              {debugInfo.simpleIconsCount === 0 && (
                <div className="mt-4 p-3 bg-red-900 rounded text-sm">
                  <p className="text-red-400 font-medium mb-1">⚠️ SimpleIcons 加载失败</p>
                  <p className="text-red-300 text-xs">请检查浏览器控制台的错误信息</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 图标列表 - 虚拟滚动优化 */}
        <div className="flex-1 w-full h-full overflow-hidden relative" key={searchTerm}>
          <MyAutoSizer>
            {({ height, width }) => {
              console.log('AutoSizer dim:', width, height);
              // 移除 padding 后的可用尺寸 (p-6 = 24px)
              const PADDING = 24;

              const safeWidth = width || 0;
              const safeHeight = height || 0;

              const availableWidth = Math.max(0, safeWidth - (PADDING * 2));

              const CELL_WIDTH = 100; // 预估每个单元格宽度
              const CELL_HEIGHT = 100; // 预估每个单元格高度
              const GAP = 16; // 间距

              const columnCount = Math.floor((availableWidth + GAP) / (CELL_WIDTH + GAP));
              // 防止 columnCount 为 0
              const safeColumnCount = columnCount > 0 ? columnCount : 1;
              const rowCount = Math.ceil(filteredIcons.length / safeColumnCount);

              // 实际单元格宽度（自适应填满宽）
              const actualCellWidth = (availableWidth - (safeColumnCount - 1) * GAP) / safeColumnCount;

              const Cell = ({ columnIndex, rowIndex, style }) => {
                const index = rowIndex * safeColumnCount + columnIndex;
                if (index >= filteredIcons.length) return null;

                const icon = filteredIcons[index];

                // 调整 style 的 top 和 left 以包含 padding
                const itemStyle = {
                  ...style,
                  left: parseFloat(style.left) + PADDING,
                  top: parseFloat(style.top) + PADDING,
                  width: actualCellWidth,
                  height: CELL_HEIGHT,
                };

                return (
                  <div style={itemStyle}>
                    <button
                      key={`${icon.source}-${icon.value}`}
                      onClick={() => onChange(icon)}
                      className={`p-3 w-full h-full rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center ${value?.value === icon.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      title={icon.label}
                    >
                      {renderIcon(icon)}
                      <span className="text-xs mt-2 text-center truncate w-full">
                        {icon.label}
                      </span>
                    </button>
                  </div>
                );
              };

              return (
                <Grid
                  columnCount={safeColumnCount}
                  columnWidth={actualCellWidth + GAP}
                  height={safeHeight}
                  rowCount={rowCount}
                  rowHeight={CELL_HEIGHT + GAP}
                  width={safeWidth}
                >
                  {Cell}
                </Grid>
              );
            }}
          </MyAutoSizer>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="font-medium">当前显示: {filteredIcons.length}</span>
              <span className="text-gray-400">/</span>
              <span>总数: {icons.length}</span>
            </div>
            <div className="flex gap-4">
              <span>📊 Simple Icons: {debugInfo?.simpleIconsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedIconSelector;