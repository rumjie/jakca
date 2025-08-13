import React from 'react';
import { MapPin, Star, Wifi, Zap, Users, Book } from 'lucide-react';
import { Cafe } from '../types/cafe';
import LikeButton from './LikeButton';

interface CafeCardProps {
  cafe: Cafe;
  onClick: () => void;
  onWriteReview: () => void;
  isFromDatabase?: boolean;
}

const CafeCard: React.FC<CafeCardProps> = ({ cafe, onClick, onWriteReview, isFromDatabase = false }) => {
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'seats':
        return <Book className="w-4 h-4" />;

      default:
        return null;
    }
  };

  const getFeatureText = (key: string, value: any) => {
    // value가 객체인 경우 처리
    if (typeof value === 'object' && value !== null) {
      return '정보 없음';
    }
    
    switch (key) {
      case 'outlets':
        return value === 'many' ? '콘센트 충분' : value === 'few' ? '콘센트 보통' : '콘센트 부족';
      case 'wifi':
        return value === 'good' ? '와이파이 빠름' : value === 'average' ? '와이파이 보통' : value === 'slow' ? '와이파이 느림' : '와이파이 없음';
      case 'seats':
        return value === 'many' ? '좌석 많음' : value === '6~10' ? '좌석 6~10개' : value === '1~5' ? '좌석 1~5개' : '좌석 없음';
      case 'deskHeight':
        return value === 'high' ? '책상 높이 높음' : value === 'low' ? '책상 높이 낮음' : value === 'mixed' ? '책상 높이 혼합' : value === 'normal' ? '책상 높이 보통' : '정보 없음';
      default:
        return String(value); // 문자열로 변환
    }
  };

  // featuresToShow 추출 로직
  let featuresToShow: any = {};
  if (isFromDatabase && cafe.reviews && cafe.reviews.length > 0) {
    featuresToShow = cafe.reviews[0].features;
  } else if (Array.isArray(cafe.features) && cafe.features[0]) {
    featuresToShow = cafe.features[0];
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group h-full">
      <div onClick={onClick} className="h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden flex items-center justify-center bg-gray-100">
          {cafe.images && cafe.images.length > 0 && cafe.images[0] ? (
            <img
              src={cafe.images[0]}
              alt={cafe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // 이미지 로딩 실패 시 첫 글자 표시로 대체
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 ${cafe.images && cafe.images.length > 0 && cafe.images[0] ? 'hidden' : ''}`}>
            <span className="text-6xl font-bold text-orange-600">
              {cafe.name ? cafe.name[0] : "?"}
            </span>
          </div>
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700">
              {cafe.distance}m
            </span>
          </div>
          <div className="absolute top-4 right-4">
            {isFromDatabase && (
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                추천
              </span>
            )}
          </div>
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
            <div className="text-right">
              <div className="flex items-center mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold text-gray-900">
                  {cafe.rating || 0}
                </span>
              </div>
              {cafe.review_count !== undefined && (
                <div className="text-sm text-gray-500">
                  {cafe.review_count}개 리뷰
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(featuresToShow ?? {})
              .filter(([key, value]) => ['seats', 'wifi'].includes(key) && value !== null && typeof value !== 'object')
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                >
                  {getFeatureIcon(key)}
                  <span className="ml-1">{getFeatureText(key, value)}</span>
                </div>
              ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWriteReview();
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              리뷰 쓰기
            </button>
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <LikeButton 
                cafeId={cafe.id} 
                size="sm" 
                showCount={false}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CafeCard;
