
import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { Cafe, NewReview } from '../types/cafe';
import { submitReviewWithCafeCheck } from '../services/cafeService';

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
    seats: '' as '0' | '1~5' | '6~10' | 'many' | '',
    deskHeight: '' as 'high' | 'low' | 'mixed' | 'normal' | '',
    outlets: '' as 'many' | 'few' | 'limited' | '',
    wifi: '' as 'excellent' | 'good' | 'average' | 'slow' | 'unavailable' | ''
  });
  const [atmosphere, setAtmosphere] = useState<string[]>([]);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [stayDuration, setStayDuration] = useState('');
  const [priceSatisfaction, setPriceSatisfaction] = useState(0);
  const [overallSatisfaction, setOverallSatisfaction] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setVisitDate(`${yyyy}-${mm}-${dd}`);
    setVisitTime(String(now.getHours()).padStart(2, '0'));
  }, []);

  const handleFeatureChange = (feature: keyof typeof features, value: any) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handleAtmosphereChange = (value: string) => {
    setAtmosphere(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim() || !purpose || !visitDate || !visitTime || !stayDuration || 
        priceSatisfaction === 0 || overallSatisfaction === 0 ||
        !features.seats || !features.deskHeight || !features.outlets || !features.wifi ||
        atmosphere.length === 0) {
      alert('모든 필수 항목을 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const review: NewReview = {
        rating,
        comment: comment.trim(),
        purpose,
        features: {
          seats: features.seats as '0' | '1~5' | '6~10' | 'many',
          deskHeight: features.deskHeight as 'high' | 'low' | 'mixed' | 'normal',
          outlets: features.outlets as 'many' | 'few' | 'limited',
          wifi: features.wifi as 'excellent' | 'good' | 'average' | 'slow' | 'unavailable'
        },
        atmosphere,
        visitDate,
        visitTime,
        stayDuration,
        priceSatisfaction,
        overallSatisfaction
      };

      await submitReviewWithCafeCheck(cafe, review);
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
              {['공부', '업무', '미팅', '휴식', '기타'].map((p) => (
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
              카페 정보 평가
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">좌석 수 *</label>
                <div className="flex flex-wrap gap-2">
                  {['0', '1~5', '6~10', 'many'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureChange('seats', option)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        features.seats === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option === 'many' ? '많음' : option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">책상 높이 *</label>
                <div className="flex flex-wrap gap-2">
                  {['high', 'low', 'normal', 'mixed'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureChange('deskHeight', option)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        features.deskHeight === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option === 'high' ? '높음' : option === 'low' ? '낮음' : option === 'normal' ? '보통' : '혼합'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">콘센트 *</label>
                <div className="flex flex-wrap gap-2">
                  {['many', 'few', 'limited'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureChange('outlets', option)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        features.outlets === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option === 'many' ? '많음' : option === 'few' ? '보통' : '부족'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">와이파이 *</label>
                <div className="flex flex-wrap gap-2">
                  {['excellent', 'good', 'average', 'slow', 'unavailable'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFeatureChange('wifi', option)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        features.wifi === option
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option === 'excellent' ? '매우 빠름' : option === 'good' ? '빠름' : option === 'average' ? '보통' : option === 'slow' ? '느림' : '없음'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Atmosphere */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              분위기 (복수 선택 가능) *
            </label>
            <div className="flex flex-wrap gap-2">
              {['조용함', '시끄러움', '감성', '아늑함', '깔끔함', '혼잡함', '밝음', '어두움','식물'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAtmosphereChange(option)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    atmosphere.includes(option)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Visit Information */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              방문 정보
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">방문 날짜 *</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">방문 시간 *</label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={String(i).padStart(2, '0')}>
                      {String(i).padStart(2, '0')}시
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-600 mb-1">체류 시간 *</label>
              <select
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">시간 선택</option>
                <option value="30분 이하">30분 이하</option>
                <option value="30분-1시간">30분-1시간</option>
                <option value="1-2시간">1-2시간</option>
                <option value="2-4시간">2-4시간</option>
                <option value="4시간 이상">4시간 이상</option>
              </select>
            </div>
          </div>

          {/* Satisfaction Ratings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              만족도 평가
            </label>
            <div className="space-y-4">
              {[
                { key: 'priceSatisfaction', label: '가격 만족도', setter: setPriceSatisfaction, value: priceSatisfaction },
                { key: 'overallSatisfaction', label: '시설 만족도', setter: setOverallSatisfaction, value: overallSatisfaction }
              ].map(({ key, label, setter, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label} *</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setter(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
            disabled={isSubmitting || rating === 0 || !comment.trim() || !purpose || !visitDate || !visitTime || !stayDuration || 
                     priceSatisfaction === 0 || overallSatisfaction === 0 ||
                     !features.seats || !features.deskHeight || !features.outlets || !features.wifi ||
                     atmosphere.length === 0}
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
