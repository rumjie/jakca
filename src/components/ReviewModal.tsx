
import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Cafe, NewReview } from '../types/cafe';
import { submitReview } from '../services/cafeService';

interface ReviewModalProps {
  cafe: Cafe;
  onClose: () => void;
  onSubmit: (review: NewReview) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ cafe, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [purpose, setPurpose] = useState('');
  const [features, setFeatures] = useState({
    quietness: '' as '좋음' | '보통' | '아쉬움' | '',
    comfort: '' as '편함' | '보통' | '불편함' | '',
    wifi: '' as '있음' | '없음' | '',
    outlets: '' as '있음' | '없음' | ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeatureSelect = (feature: keyof typeof features, value: any) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      alert('평점과 리뷰를 모두 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const review: NewReview = {
        rating,
        comment: comment.trim(),
        purpose,
        features: {
          quietness: features.quietness || '보통',
          comfort: features.comfort || '보통',
          wifi: features.wifi || '없음',
          outlets: features.outlets || '없음'
        }
      };

      await submitReview(cafe.id, review);
      onSubmit(review);
    } catch (error) {
      console.error('리뷰 제출 실패:', error);
      alert('리뷰 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">리뷰 작성</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Cafe Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900">{cafe.name}</h3>
            <p className="text-sm text-gray-600">{cafe.address}</p>
          </div>

          {/* Overall Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전체 평점 *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `${rating}점`}
              </span>
            </div>
          </div>

          {/* Purpose */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방문 목적
            </label>
            <div className="flex flex-wrap gap-2">
              {['공부', '업무', '미팅', '휴식', '데이트'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    purpose === p
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Ratings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              세부 평가
            </label>
            <div className="space-y-4">
              {/* Quietness */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">조용함</span>
                <div className="flex gap-2">
                  {['좋음', '보통', '아쉬움'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureSelect('quietness', option)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        features.quietness === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comfort */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">편안함</span>
                <div className="flex gap-2">
                  {['편함', '보통', '불편함'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureSelect('comfort', option)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        features.comfort === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* WiFi */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">와이파이</span>
                <div className="flex gap-2">
                  {['있음', '없음'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureSelect('wifi', option)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        features.wifi === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outlets */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">콘센트</span>
                <div className="flex gap-2">
                  {['있음', '없음'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureSelect('outlets', option)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        features.outlets === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용 *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="카페에 대한 솔직한 후기를 남겨주세요..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none h-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {comment.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            {isSubmitting ? '제출 중...' : '리뷰 제출하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
