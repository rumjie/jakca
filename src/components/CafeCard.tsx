
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
        return <Wifi className="w-3 h-3" />;
      case 'outlets':
        return <Zap className="w-3 h-3" />;
      case 'seats':
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getFeatureText = (key: string, value: any) => {
    switch (key) {
      case 'outlets':
        return value === 'many' ? '콘센트 충분' : value === 'few' ? '콘센트 보통' : '콘센트 부족';
      case 'wifi':
        return value === 'excellent' ? '빠름' : value === 'good' ? '보통' : '느림';
      case 'seats':
        return `${value}석`;
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group h-full">
      <div onClick={onClick} className="h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-32 overflow-hidden">
          <img
            src={cafe.images[0]}
            alt={cafe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
              {cafe.distance}km
            </span>
          </div>
          {cafe.features.recommended && (
            <div className="absolute top-2 right-2">
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                추천
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{cafe.name}</h3>
            <div className="flex items-center text-gray-600 text-xs mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{cafe.address}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold text-gray-900 text-sm">{cafe.rating}</span>
                <span className="text-xs text-gray-600 ml-1">({cafe.reviewCount})</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                <span className={cafe.hours.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {cafe.hours.isOpen ? '영업중' : '영업종료'}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-2">
            {Object.entries(cafe.features).slice(0, 2).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700"
              >
                {getFeatureIcon(key)}
                <span className="ml-1">{getFeatureText(key, value)}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3 flex-1">
            {cafe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={onClick}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              상세보기
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWriteReview();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              리뷰
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
