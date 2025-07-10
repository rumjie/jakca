import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Clock, Wifi, Zap, Users, Book } from 'lucide-react';
import { Cafe } from '../types/cafe';

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
  onWriteReview: () => void;
}

const CafeDetail: React.FC<CafeDetailProps> = ({ cafe, onClose, onWriteReview }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'seats':
        return <Users className="w-5 h-5" />;
      case 'outlets':
        return <Zap className="w-5 h-5" />;
      case 'wifi':
        return <Wifi className="w-5 h-5" />;
      case 'deskHeight':
        return <Book className="w-5 h-5" />;
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{cafe.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Images */}
        <div className="relative">
          <div className="aspect-[18/6] overflow-hidden">
            {cafe.images && cafe.images.length > 0 && cafe.images[currentImageIndex] ? (
              <img
                src={cafe.images[currentImageIndex]}
                alt={cafe.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 이미지 로드 실패 시 첫 글자 표시
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                        <span class="text-4xl font-bold text-orange-600">
                          ${cafe.name ? cafe.name[0] : "?"}
                        </span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                <span className="text-4xl font-bold text-orange-600">
                  {cafe.name ? cafe.name[0] : "?"}
                </span>
              </div>
            )}
          </div>
          {cafe.images && cafe.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {cafe.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold text-lg">{cafe.rating || 0}</span>
                <span className="text-gray-600 ml-2">
                  ({cafe.review_count !== undefined ? cafe.review_count : 0}개 리뷰)
                </span>
              </div>
              {/* DB에서 나온 카페면 추천 마크 표시 */}
              {cafe.features && cafe.features.recommended && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  추천
                </span>
              )}
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {cafe.address} • {cafe.distance}m
            </div>
          </div>

          {/* Cafe Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">카페 정보</h3>
            <div className="space-y-4">
              {/* Address and Rating in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Address */}
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-600 mr-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">주소</div>
                    <div className="text-sm text-gray-600">{cafe.address}</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-600 mr-3">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">평점</div>
                    <div className="text-sm text-gray-600">
                      {cafe.rating ? `${cafe.rating}/5 (${cafe.review_count}개 리뷰)` : '평점 없음'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">카페 특징</h4>
                <div className="grid grid-cols-2 gap-4">
                  {cafe.features && Array.isArray(cafe.features) && cafe.features[0] && 
                    Object.entries(cafe.features[0])
                      .filter(([key, value]) => key !== 'recommended' && typeof value !== 'object' && value !== null)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="text-gray-600 mr-3">
                            {getFeatureIcon(key)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getFeatureText(key, value)}
                            </div>
                          </div>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>


          {/* Comments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">최근 리뷰</h3>
            <div className="space-y-4">
              {cafe.comments && cafe.comments.length > 0 ? (
                cafe.comments.slice(0, 3).map((comment, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700">{comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 리뷰가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onWriteReview}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              리뷰 작성하기
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors">
              즐겨찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeDetail;
