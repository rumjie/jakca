import React, { useState } from 'react';
import { X, MapPin, Star, Clock, Wifi, Zap, Users, Book } from 'lucide-react';
import { Cafe } from '../types/cafe';

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
  onWriteReview: () => void;
}

const CafeDetail: React.FC<CafeDetailProps> = ({ cafe, onClose, onWriteReview }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const getFeatureDescription = (key: string, value: any) => {
    switch (key) {
      case 'seats':
        return value === 'many' ? '좌석 많음' : value === '6~10' ? '좌석 6~10개' : value === '1~5' ? '좌석 1~5개' : '좌석 없음';
      case 'deskHeight':
        return value === 'high' ? '높은 테이블' : value === 'low' ? '낮은 테이블' : '다양한 높이';
      case 'outlets':
        return value === 'many' ? '콘센트 충분함' : value === 'few' ? '콘센트 보통' : '콘센트 부족';
      case 'wifi':
        return value === 'excellent' ? '와이파이 매우 빠름' : value === 'good' ? '와이파이 빠름' : '와이파이 보통';
      case 'atmosphere':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value;
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
          <div className="aspect-video overflow-hidden">
            <img
              src={cafe.images[currentImageIndex]}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
          </div>
          {cafe.images.length > 1 && (
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
                <span className="font-semibold text-lg">{cafe.rating}</span>
                <span className="text-gray-600 ml-2">({cafe.reviewCount}개 리뷰)</span>
              </div>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {cafe.address} • {cafe.distance}km
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className={cafe.hours.isOpen ? 'text-green-600' : 'text-red-600'}>
                {cafe.hours.isOpen ? '영업중' : '영업종료'}
              </span>
              <span className="ml-2">{cafe.hours.open} - {cafe.hours.close}</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">카페 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(cafe.features).map(([key, value]) => (
                <div key={key} className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-600 mr-3">
                    {getFeatureIcon(key)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getFeatureDescription(key, value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">코멘트</h3>
            <div className="space-y-2">
              {cafe.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">최근 리뷰</h3>
            <div className="space-y-4">
              {cafe.reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium">{review.userName}</span>
                      <div className="flex items-center ml-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    도움됨 {review.helpful}
                  </div>
                </div>
              ))}
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
