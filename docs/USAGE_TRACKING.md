# 使用量管理和计费系统

## 📊 配额系统设计

### 免费配额限制

```javascript
// src/config/quotas.js
export const FREE_QUOTA = {
  aiOptimizations: 10,        // AI 标题优化
  imageGenerations: 3,        // AI 图片生成  
  colorRecommendations: 20,   // 智能配色推荐
  iconRecommendations: 15,     // AI 图标推荐
  batchGenerations: 5,        // 批量生成
  downloads: 50,              // 图片下载
  customUploads: 5            // 自定义图片上传
};

export const PRO_QUOTA = {
  ...FREE_QUOTA,
  aiOptimizations: 500,
  imageGenerations: 100,
  colorRecommendations: 1000,
  iconRecommendations: 500,
  batchGenerations: 100,
  downloads: 1000,
  customUploads: 100
};

export const ENTERPRISE_QUOTA = {
  ...PRO_QUOTA,
  aiOptimizations: -1,       // -1 表示无限制
  imageGenerations: -1,
  colorRecommendations: -1,
  iconRecommendations: -1,
  batchGenerations: -1,
  downloads: -1,
  customUploads: -1
};
```

### 使用量追踪实现

```javascript
// src/hooks/useUsageTracker.js (增强版)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { FREE_QUOTA, PRO_QUOTA, ENTERPRISE_QUOTA } from '../config/quotas';

export const useUsageTracker = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState({
    aiOptimizations: 0,
    imageGenerations: 0,
    colorRecommendations: 0,
    iconRecommendations: 0,
    batchGenerations: 0,
    downloads: 0,
    customUploads: 0,
    totalUsage: 0
  });
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // 获取用户订阅信息
  useEffect(() => {
    if (user) {
      fetchUserSubscription();
      fetchUserUsage();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSubscription(data);
      } else {
        // 创建免费订阅记录
        const { data: newSub, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert([{
            user_id: user.id,
            plan: 'free',
            status: 'active'
          }])
          .select()
          .single();

        if (!insertError) {
          setSubscription(newSub);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const getCurrentQuota = useCallback(() => {
    const plan = subscription?.plan || 'free';
    switch (plan) {
      case 'pro': return PRO_QUOTA;
      case 'enterprise': return ENTERPRISE_QUOTA;
      default: return FREE_QUOTA;
    }
  }, [subscription]);

  const incrementUsage = useCallback(async (type) => {
    if (!user) return false;

    const fieldMap = {
      aiOptimizations: 'ai_optimizations',
      imageGenerations: 'image_generations',
      colorRecommendations: 'color_recommendations',
      iconRecommendations: 'icon_recommendations',
      batchGenerations: 'batch_generations',
      downloads: 'downloads',
      customUploads: 'custom_uploads'
    };

    const field = fieldMap[type];
    const currentValue = usage[type];
    const quota = getCurrentQuota();
    const maxValue = quota[type];

    // 检查无限制
    if (maxValue !== -1 && currentValue >= maxValue) {
      showUpgradePrompt(type, quota);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_usage')
        .update({
          [field]: currentValue + 1,
          total_usage: usage.totalUsage + 1
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUsage(data);
      
      // 记录使用量到分析
      trackUsageEvent(type, subscription?.plan || 'free');
      
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }, [user, usage, subscription, getCurrentQuota]);

  const remainingQuota = Object.keys(FREE_QUOTA).reduce((acc, key) => {
    const quota = getCurrentQuota();
    const max = quota[key];
    const current = usage[key];
    acc[key] = max === -1 ? '无限制' : Math.max(0, max - current);
    return acc;
  }, {});

  const canUse = useCallback((type) => {
    const quota = getCurrentQuota();
    const max = quota[type];
    const current = usage[type];
    return max === -1 || current < max;
  }, [usage, getCurrentQuota]);

  return {
    usage,
    subscription,
    loading,
    incrementUsage,
    remainingQuota,
    getCurrentQuota,
    canUse,
    isUnlimited: (type) => getCurrentQuota()[type] === -1
  };
};
```

## 💰 订阅管理

### 订阅价格配置

```javascript
// src/config/pricing.js
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: '免费版',
    price: 0,
    interval: 'month',
    features: [
      '10 次 AI 标题优化',
      '3 次 AI 图片生成',
      '20 次配色推荐',
      '15 次图标推荐',
      '50 次图片下载'
    ],
    cta: '当前计划',
    popular: false
  },
  pro: {
    id: 'pro',
    name: 'Pro 版',
    price: 19,
    interval: 'month',
    features: [
      '500 次 AI 标题优化',
      '100 次 AI 图片生成',
      '1000 次配色推荐',
      '500 次图标推荐',
      '1000 次图片下载',
      '无水印导出',
      '优先技术支持'
    ],
    cta: '立即升级',
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: '企业版',
    price: 99,
    interval: 'month',
    features: [
      '无限制 AI 功能',
      'API 访问权限',
      '自定义品牌',
      '团队协作功能',
      '专属客户经理',
      'SLA 保证'
    ],
    cta: '联系销售',
    popular: false
  }
};
```

### 订阅管理组件

```jsx
// src/components/SubscriptionManager.js
import React, { useState } from 'react';
import { PRICING_PLANS } from '../config/pricing';
import { useUsageTracker } from '../hooks/useUsageTracker';

const SubscriptionManager = ({ isOpen, onClose }) => {
  const { subscription, remainingQuota, getCurrentQuota } = useUsageTracker();
  const [loading, setLoading] = useState(false);
  const currentPlan = subscription?.plan || 'free';

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      // 调用支付服务 (Stripe, PayPal, etc.)
      await createCheckoutSession(planId);
    } catch (error) {
      console.error('升级失败:', error);
      alert('升级失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planId) => {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        userId: user.id
      })
    });

    const { url } = await response.json();
    window.location.href = url; // 跳转到支付页面
  };

  return (
    <div className={`subscription-modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-6">选择订阅计划</h2>
        
        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(PRICING_PLANS).map(plan => (
            <div 
              key={plan.id}
              className={`pricing-card ${plan.id === currentPlan ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">最受欢迎</div>
              )}
              
              <div className="price">
                <span className="amount">¥{plan.price}</span>
                <span className="interval">/{plan.interval === 'month' ? '月' : '年'}</span>
              </div>
              
              <h3 className="plan-name">{plan.name}</h3>
              
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.id === currentPlan || loading}
                className={`upgrade-btn ${plan.id === currentPlan ? 'disabled' : ''}`}
              >
                {plan.id === currentPlan ? '当前计划' : plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <button onClick={onClose} className="close-btn">关闭</button>
      </div>
    </div>
  );
};

export default SubscriptionManager;
```

## 📈 使用量分析

### 使用量统计组件

```jsx
// src/components/UsageAnalytics.js
import React from 'react';
import { useUsageTracker } from '../hooks/useUsageTracker';

const UsageAnalytics = () => {
  const { usage, subscription, remainingQuota, getCurrentQuota } = useUsageTracker();
  const quota = getCurrentQuota();

  const getUsagePercentage = (type) => {
    const max = quota[type];
    const current = usage[type];
    if (max === -1) return 0;
    return Math.min(100, (current / max) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'yellow';
    return 'green';
  };

  const usageMetrics = [
    { key: 'aiOptimizations', label: 'AI 标题优化', icon: '🤖' },
    { key: 'imageGenerations', label: 'AI 图片生成', icon: '🎨' },
    { key: 'colorRecommendations', label: '配色推荐', icon: '🎯' },
    { key: 'iconRecommendations', label: '图标推荐', icon: '💡' },
    { key: 'downloads', label: '图片下载', icon: '📥' }
  ];

  return (
    <div className="usage-analytics">
      <div className="subscription-info">
        <h3>当前计划: <span className="plan-name">{subscription?.plan || '免费'}</span></h3>
        <p>使用期限: {new Date(subscription?.current_period_end).toLocaleDateString()}</p>
      </div>

      <div className="usage-metrics">
        {usageMetrics.map(metric => {
          const percentage = getUsagePercentage(metric.key);
          const remaining = remainingQuota[metric.key];
          const max = quota[metric.key];
          
          return (
            <div key={metric.key} className="usage-metric">
              <div className="metric-header">
                <span className="metric-icon">{metric.icon}</span>
                <span className="metric-label">{metric.label}</span>
                <span className="metric-remaining">
                  {max === -1 ? '无限制' : `${remaining} / ${max}`}
                </span>
              </div>
              
              {max !== -1 && (
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getUsageColor(percentage)
                    }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="usage-summary">
        <div className="total-usage">
          总使用次数: <strong>{usage.totalUsage}</strong>
        </div>
        <button className="upgrade-btn" onClick={() => setShowSubscription(true)}>
          {subscription?.plan === 'free' ? '升级计划' : '管理订阅'}
        </button>
      </div>
    </div>
  );
};

export default UsageAnalytics;
```

## 💳 支付集成

### Stripe 支付处理

```javascript
// src/services/paymentService.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const PaymentService = {
  async createCheckoutSession(planId, userId) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId })
      });

      const session = await response.json();
      
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (error) throw error;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  },

  async createCustomerPortalSession(userId) {
    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      throw error;
    }
  }
};
```

### 支付 Webhook 处理

```javascript
// functions/webhooks/stripe.js
export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleSubscriptionCreated(session);
      break;
      
    case 'invoice.payment_succeeded':
      await handleSubscriptionRenewed(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

async function handleSubscriptionCreated(session) {
  const { userId, planId } = session.metadata;
  
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: planId,
      status: 'active',
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      current_period_start: new Date(session.created * 1000),
      current_period_end: new Date(session.expires_at * 1000)
    });
}
```

## 📊 数据分析

### 使用量分析 API

```sql
-- 创建分析视图
CREATE VIEW usage_analytics AS
SELECT 
  u.plan,
  COUNT(*) as user_count,
  AVG(ua.total_usage) as avg_total_usage,
  AVG(ua.ai_optimizations) as avg_ai_optimizations,
  AVG(ua.image_generations) as avg_image_generations,
  SUM(ua.total_usage) as total_usage,
  DATE_TRUNC('month', ua.created_at) as month
FROM user_subscriptions u
JOIN user_usage ua ON u.user_id = ua.user_id
WHERE u.status = 'active'
GROUP BY u.plan, DATE_TRUNC('month', ua.created_at)
ORDER BY month DESC;
```

### 使用量报告组件

```jsx
// src/components/UsageReport.js
import React, { useState, useEffect } from 'react';

const UsageReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageReport();
  }, []);

  const fetchUsageReport = async () => {
    try {
      const response = await fetch('/api/usage-report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="usage-report">
      <h3>使用量统计</h3>
      
      <div className="report-grid">
        <div className="report-card">
          <h4>月活跃用户</h4>
          <p className="metric">{report?.monthlyActiveUsers}</p>
        </div>
        
        <div className="report-card">
          <h4>AI 功能使用次数</h4>
          <p className="metric">{report?.totalAIUsage}</p>
        </div>
        
        <div className="report-card">
          <h4>免费用户转化率</h4>
          <p className="metric">{report?.conversionRate}%</p>
        </div>
      </div>
      
      <div className="usage-chart">
        {/* 这里可以集成 Chart.js 或其他图表库 */}
      </div>
    </div>
  );
};

export default UsageReport;
```

这个使用量管理系统提供了完整的配额控制、订阅管理和支付集成功能，能够有效控制成本并提供良好的用户体验。