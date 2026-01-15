import React, { useState, useEffect } from 'react';
import aiService from '../services/aiService';

const AIConfigDebug = ({ show = false }) => {
  const [config, setConfig] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (show) {
      setConfig(aiService.getConfig());
    }
  }, [show]);

  const testModel = async (modelName) => {
    setTesting(true);
    setTestResults(prev => ({
      ...prev,
      [modelName]: { loading: true }
    }));

    try {
      const result = await aiService.testModel(modelName);
      setTestResults(prev => ({
        ...prev,
        [modelName]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [modelName]: { success: false, error: error.message }
      }));
    } finally {
      setTesting(false);
    }
  };

  if (!show || !config) return null;

  return (
    <div className="ai-config-debug bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">🔧 AI 配置信息</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 配置信息 */}
        <div>
          <h4 className="font-medium text-sm mb-2">当前配置</h4>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span>API Key:</span>
              <span className={config.configured ? 'text-green-600' : 'text-red-600'}>
                {config.configured ? '✓ 已配置' : '✗ 未配置'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>标题模型:</span>
              <span>{config.models.title}</span>
            </div>
            <div className="flex justify-between">
              <span>配色模型:</span>
              <span>{config.models.color}</span>
            </div>
            <div className="flex justify-between">
              <span>图标模型:</span>
              <span>{config.models.icon}</span>
            </div>
            <div className="flex justify-between">
              <span>图片模型:</span>
              <span>{config.models.image}</span>
            </div>
          </div>
        </div>

        {/* 模型测试 */}
        <div>
          <h4 className="font-medium text-sm mb-2">模型测试</h4>
          <div className="space-y-2">
            {config.models.title && (
              <div className="flex items-center justify-between">
                <span className="text-xs">{config.models.title}</span>
                <button
                  onClick={() => testModel(config.models.title)}
                  disabled={testing}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  {testResults[config.models.title]?.loading ? '测试中...' : '测试'}
                </button>
              </div>
            )}
            
            {testResults[config.models.title] && (
              <div className="text-xs p-2 rounded bg-gray-100">
                {testResults[config.models.title].success ? (
                  <span className="text-green-600">
                    ✓ {testResults[config.models.title].response}
                  </span>
                ) : (
                  <span className="text-red-600">
                    ✗ {testResults[config.models.title].error}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 推荐模型 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="font-medium text-sm mb-2">推荐模型配置</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded">
            <strong>高性价比:</strong> anthropic/claude-3-haiku (~$0.0003/1K)
          </div>
          <div className="bg-green-50 p-2 rounded">
            <strong>平衡型:</strong> openai/gpt-4o-mini (~$0.00015/1K)
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <strong>高质量:</strong> anthropic/claude-3-sonnet (~$0.003/1K)
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <strong>开源:</strong> meta-llama/llama-3.1-8b (~$0.00005/1K)
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        💡 在 .env.local 中修改 REACT_APP_AI_*_MODEL 环境变量来切换模型
      </div>
    </div>
  );
};

export default AIConfigDebug;