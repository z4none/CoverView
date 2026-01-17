import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UsageDisplay = ({ remainingQuota, FREE_QUOTA }) => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <img
            src={user.user_metadata?.avatar_url}
            alt={user.user_metadata?.user_name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">
              {user.user_metadata?.user_name || user.email}
            </p>
            <p className="text-sm text-gray-500">Free Plan</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign Out
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">AI Title Optimization</span>
          <span className="text-sm font-medium">
            {remainingQuota.aiOptimizations}/{FREE_QUOTA.aiOptimizations}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">AI Color Recommendation</span>
          <span className="text-sm font-medium">
            {remainingQuota.colorRecommendations}/{FREE_QUOTA.colorRecommendations}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">AI Image Generation</span>
          <span className="text-sm font-medium">
            {remainingQuota.imageGenerations}/{FREE_QUOTA.imageGenerations}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded transition duration-200">
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
};

export default UsageDisplay;