import React, { useState } from 'react';

const AISuggestions = ({ 
  suggestions = [], 
  onSelectSuggestion, 
  loading = false, 
  error = null,
  onClose 
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const handleSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);
    onSelectSuggestion(suggestion);
  };

  if (loading) {
    return (
      <div className="ai-suggestions bg-white rounded-lg shadow-lg p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">AI 正在优化标题...</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-suggestions bg-red-50 border border-red-200 rounded-lg p-6 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-red-800">优化失败</h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
        <p className="text-red-600 text-xs mt-2">请检查网络连接或稍后重试</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="ai-suggestions bg-white rounded-lg shadow-lg p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🤖 AI 优化建议 ({suggestions.length}个方案)
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            onClick={() => handleSelect(suggestion)}
            className={`suggestion-item p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedSuggestion === suggestion 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    方案 {index + 1}
                  </span>
                  {selectedSuggestion === suggestion && (
                    <span className="ml-2 text-xs text-green-600 font-medium">
                      ✓ 已选择
                    </span>
                  )}
                </div>
                <p className="text-gray-800 font-medium">{suggestion}</p>
              </div>
              <div className="ml-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(suggestion);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  使用此标题
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 提示：点击任意方案使用该标题，或继续编辑当前标题
        </p>
      </div>
    </div>
  );
};

export default AISuggestions;