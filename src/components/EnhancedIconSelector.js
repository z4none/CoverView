import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { useTranslation } from 'react-i18next';
import { simpleIconsMapping } from '../utils/simpleIconsMapping';

// Simple AutoSizer implementation to avoid library compatibility issues
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
const CACHE_EXPIRY_HOURS = 24; // Cache for 24 hours

const EnhancedIconSelector = ({ value, onChange, onClose }) => {
  const { t } = useTranslation();
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  // Check if cache is valid
  const isCacheValid = (cacheData) => {
    if (!cacheData || !cacheData.timestamp) return false;
    const cacheTime = new Date(cacheData.timestamp);
    const now = new Date();
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    return hoursDiff < CACHE_EXPIRY_HOURS;
  };

  useEffect(() => {
    // Load SimpleIcons
    const loadIcons = async () => {
      try {
        setLoading(true);

        // Try loading from cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          if (isCacheValid(parsedCache)) {
            console.log('✅ Loaded SimpleIcons from cache:', parsedCache.icons.length, 'icons');
            console.log('📅 Cache time:', new Date(parsedCache.timestamp).toLocaleString());

            const allIcons = [
              { value: 'upload-your-own', label: t('iconSelector.uploadOwn'), source: 'custom', library: 'Custom', category: 'custom' },
              ...parsedCache.icons
            ];



            setIcons(allIcons);
            setLoading(false);
            return;
          }
        }

        // Cache invalid or not found, load from network
        console.log('🔄 Loading SimpleIcons from network...');

        const simpleIconsResponse = await fetch(
          'https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json'
        );
        const simpleIconsData = await simpleIconsResponse.json();

        console.log('📊 SimpleIcons structure:', Object.keys(simpleIconsData));
        console.log('📊 SimpleIcons.icons exists:', !!simpleIconsData.icons);
        console.log('📊 SimpleIcons.icons length:', simpleIconsData.icons?.length || 0);

        // Process SimpleIcons
        let simpleIcons = [];

        if (simpleIconsData.icons && Array.isArray(simpleIconsData.icons)) {
          console.log('🎨 SimpleIcons format: data.icons array');
          simpleIcons = simpleIconsData.icons
            .filter(icon => icon.title)
            .map(icon => {
              // Try to find slug in our hardcoded mapping first
              const mappedSlug = simpleIconsMapping[icon.title];
              const apiSlug = (icon.slug === icon.title.toLowerCase().replace(/[^a-z0-9]/g, '') && icon.title.includes(' ')) ? icon.title.toLowerCase().replace(/\s+/g, '-') : icon.slug;

              return {
                value: icon.title.toLowerCase().replace(/\s+/g, '-'),
                label: icon.title,
                source: 'simpleicons',
                library: 'Simple Icons',
                hex: icon.hex || '#666666',
                slug: mappedSlug || apiSlug, // Use mapped slug if available, otherwise API slug
                category: getIconCategory(icon.title)
              };
            });
        } else if (Array.isArray(simpleIconsData)) {
          console.log('🎨 SimpleIcons format: direct array');
          simpleIcons = simpleIconsData
            .filter(item => item.title)
            .map(icon => {
              // Try to find slug in our hardcoded mapping first
              const mappedSlug = simpleIconsMapping[icon.title];

              return {
                value: icon.title.toLowerCase().replace(/\s+/g, '-'),
                label: icon.title,
                source: 'simpleicons',
                library: 'Simple Icons',
                hex: icon.hex || '#666666',
                slug: mappedSlug || icon.slug, // Use mapped slug if available
                category: getIconCategory(icon.title)
              };
            });
        } else {
          console.error('❌ SimpleIcons format unrecognized:', simpleIconsData);
        }

        console.log('✅ SimpleIcons loaded:', simpleIcons.length, 'icons');

        // Merge and add custom upload option
        const allIcons = [
          { value: 'upload-your-own', label: t('iconSelector.uploadOwn'), source: 'custom', library: 'Custom', category: 'custom' },
          ...simpleIcons
        ];

        console.log('🎉 All icons loaded:', allIcons.length, 'icons');

        // Save to cache
        const cacheData = {
          icons: simpleIcons,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('💾 SimpleIcons data cached');



        setIcons(allIcons);
      } catch (error) {
        console.error('❌ Error loading icons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, [t]);

  // Infer icon category from name
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

  // Filter icons
  const filteredIcons = useMemo(() => {
    return icons.filter(icon => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return icon.label.toLowerCase().includes(term);
    });
  }, [icons, searchTerm]);

  // Render single icon
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
            <span className="ml-3">{t('iconSelector.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('iconSelector.title')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder={t('iconSelector.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


        </div>

        {/* Icon List - Virtualized */}
        <div className="flex-1 w-full h-full overflow-hidden relative" key={searchTerm}>
          <MyAutoSizer>
            {({ height, width }) => {
              // Remove padding (p-6 = 24px)
              const PADDING = 24;

              const safeWidth = width || 0;
              const safeHeight = height || 0;

              const availableWidth = Math.max(0, safeWidth - (PADDING * 2));

              const CELL_WIDTH = 100; // Estimated cell width
              const CELL_HEIGHT = 100; // Estimated cell height
              const GAP = 16; // Gap

              const columnCount = Math.floor((availableWidth + GAP) / (CELL_WIDTH + GAP));
              // Prevent columnCount from being 0
              const safeColumnCount = columnCount > 0 ? columnCount : 1;
              const rowCount = Math.ceil(filteredIcons.length / safeColumnCount);

              // Actual cell width (autosize)
              const actualCellWidth = (availableWidth - (safeColumnCount - 1) * GAP) / safeColumnCount;

              const Cell = ({ columnIndex, rowIndex, style }) => {
                const index = rowIndex * safeColumnCount + columnIndex;
                if (index >= filteredIcons.length) return null;

                const icon = filteredIcons[index];

                // Adjust style top and left to include padding
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

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="font-medium">{t('iconSelector.showing')}: {filteredIcons.length}</span>
              <span className="text-gray-400">/</span>
              <span>{t('iconSelector.total')}: {icons.length}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedIconSelector;