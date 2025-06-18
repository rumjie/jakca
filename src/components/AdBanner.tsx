
import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-blue-600 font-medium mb-1">광고</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            카페 사장님들을 위한 특별한 혜택! 
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            우리 카페도 리스트에 등록하고 더 많은 고객을 만나보세요
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            지금 등록하기
          </button>
        </div>
        <div className="ml-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl">☕</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
