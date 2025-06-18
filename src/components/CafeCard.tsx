
import React from 'react';
import { MapPin, Star, Clock, Wifi, Zap, Users } from 'lucide-react';
import { Cafe } from '../types/cafe';

interface CafeCardProps {
  cafe: Cafe;
  onClick: () => void;
  onWriteReview: () => void;
}

const CafeCard: React.FC<CafeCardProps> = ({ cafe, onClick, onWriteReview }) => {
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'outlets':
        return <Zap className="w-4 h-4" />;
      case 'seats':
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getFeatureText = (key: string, value: any) => {
    switch (key) {
      case 'outlets':
        return value === 'many' ? '콘센트 충분' : value === 'few' ? '콘센트 보통' : '콘센트 부족';
      case 'wifi':
        return value === 'excellent' ? '와이파이 빠름' : value === 'good' ? '와이파이 보통' : '와이파이 느림';
      case 'seats':
        return `좌석 ${value}개`;
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group">
      <div onClick={onClick}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={cafe.images[0]}
            alt={cafe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700">
              {cafe.distance}km
            </span>
          </div>
          <div className="absolute top-4 right-4">
            {cafe.features.recommended && (
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                추천
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{cafe.name}</h3>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {cafe.address}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold text-gray-900">{cafe.rating}</span>
              </div>
              <span className="text-sm text-gray-600">{cafe.reviewCount}개 리뷰</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(cafe.features).slice(0, 3).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
              >
                {getFeatureIcon(key)}
                <span className="ml-1">{getFeatureText(key, value)}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {cafe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Hours & Price */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span className={cafe.hours.isOpen ? 'text-green-600' : 'text-red-600'}>
                {cafe.hours.isOpen ? '영업중' : '영업종료'} • {cafe.hours.open}-{cafe.hours.close}
              </span>
            </div>
            <span>{cafe.priceRange}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <div className="flex gap-3">
          <button
            onClick={onClick}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
          >
            상세보기
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWriteReview();
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors"
          >
            리뷰쓰기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
