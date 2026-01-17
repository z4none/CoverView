import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// 使用量追踪 Hook
export const useUsageTracker = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState({
    aiOptimizations: 0,
    imageGenerations: 0,
    colorRecommendations: 0,
    totalUsage: 0
  });
  const [loading, setLoading] = useState(true);

  const FREE_QUOTA = {
    aiOptimizations: 10,
    imageGenerations: 3,
    colorRecommendations: 20
  };

  const fetchUserUsage = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching usage:', error);
        return;
      }

      if (data) {
        setUsage(data);
      } else {
        // 创建新的使用记录
        const { data: newUsage, error: insertError } = await supabase
          .from('user_usage')
          .insert([{
            user_id: user.id,
            ai_optimizations: 0,
            image_generations: 0,
            color_recommendations: 0
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating usage record:', insertError);
        } else {
          setUsage(newUsage);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserUsage:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserUsage();
    }
  }, [user, fetchUserUsage]);

  const incrementUsage = async (type) => {
    if (!user) return false;

    const fieldMap = {
      aiOptimizations: 'ai_optimizations',
      imageGenerations: 'image_generations',
      colorRecommendations: 'color_recommendations'
    };

    const field = fieldMap[type];
    const currentValue = usage[type];
    const maxValue = FREE_QUOTA[type];

    if (currentValue >= maxValue) {
      alert(`You have reached the free limit (${maxValue} times/month). Please upgrade to Pro to continue.`);
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

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      setUsage(data);
      return true;
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  };

  const remainingQuota = {
    aiOptimizations: Math.max(0, FREE_QUOTA.aiOptimizations - usage.aiOptimizations),
    imageGenerations: Math.max(0, FREE_QUOTA.imageGenerations - usage.imageGenerations),
    colorRecommendations: Math.max(0, FREE_QUOTA.colorRecommendations - usage.colorRecommendations)
  };

  return {
    usage,
    loading,
    incrementUsage,
    remainingQuota,
    FREE_QUOTA,
    canUse: (type) => remainingQuota[type] > 0
  };
};