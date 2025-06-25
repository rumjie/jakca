import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Wifi, Zap, Users, Star, Plus } from 'lucide-react';
import CafeCard from '../components/CafeCard';
import CafeDetail from '../components/CafeDetail';
import ReviewModal from '../components/ReviewModal';
import AdBanner from '../components/AdBanner';
import SimpleCafeList from '../components/SimpleCafeList';
import { getCafesNearby, getCafeById, getNearbySimpleCafes } from '../services/cafeService';
import { Cafe } from '../types/cafe';

const Index = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [simpleCafes, setSimpleCafes] = useState<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('현재 위치');
  const [showSimpleList, setShowSimpleList] = useState(false);

  useEffect(() => {
    // Simulate getting user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation('강남구, 서울');
          loadCafes();
        },
        () => {
          setUserLocation('강남구, 서울');
          loadCafes();
        }
      );
    } else {
      loadCafes();
    }
  }, []);

  const loadCafes = async () => {
    try {
      setLoading(true);
      const nearbyeCafes = await getCafesNearby();
      
      if (nearbyeCafes.length === 0) {
        // No cafes found in database, show simple list
        setShowSimpleList(true);
        const simpleCafeList = await getNearbySimpleCafes();
        setSimpleCafes(simpleCafeList);
      } else {
        setCafes(nearbyeCafes);
        setShowSimpleList(false);
      }
    } catch (error) {
      console.error('카페 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCafeClick = async (cafeId: string) => {
    try {
      const cafe = await getCafeById(cafeId);
      setSelectedCafe(cafe);
    } catch (error) {
      console.error('카페 상세 정보 로딩 실패:', error);
    }
  };

  const handleWriteReview = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowReviewModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">카페 찾기</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {userLocation}
              </div>
            </div>
            <div className="bg-orange-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-orange-800">
                {showSimpleList ? `${simpleCafes.length}개 카페 발견` : `${cafes.length}개 카페 발견`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {!showSimpleList && (
            <>
              {/* Purpose Filter */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">어떤 목적으로 방문하시나요?</h2>
                <div className="flex flex-wrap gap-3">
                  {['공부', '업무', '미팅', '휴식', '데이트'].map((purpose) => (
                    <button
                      key={purpose}
                      className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-full text-sm font-medium transition-colors"
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cafe Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cafes.map((cafe, index) => (
                  <React.Fragment key={cafe.id}>
                    <CafeCard
                      cafe={cafe}
                      onClick={() => handleCafeClick(cafe.id)}
                      onWriteReview={() => handleWriteReview(cafe)}
                    />
                    {/* Ad Banner after 2nd cafe on mobile, after 4th on desktop */}
                    {((index === 1 && window.innerWidth < 768) || (index === 3 && window.innerWidth >= 768)) && (
                      <div className="md:col-span-2">
                        <AdBanner />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center py-6">
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full border border-gray-200 font-medium transition-colors">
                  더 많은 카페 보기
                </button>
              </div>
            </>
          )}

          {/* Simple Cafe List when no database results */}
          {showSimpleList && (
            <SimpleCafeList cafes={simpleCafes} />
          )}
        </div>
      </div>

      {/* Cafe Detail Modal */}
      {selectedCafe && !showReviewModal && (
        <CafeDetail
          cafe={selectedCafe}
          onClose={() => setSelectedCafe(null)}
          onWriteReview={() => setShowReviewModal(true)}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedCafe && (
        <ReviewModal
          cafe={selectedCafe}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedCafe(null);
          }}
          onSubmit={(review) => {
            console.log('새 리뷰 저장됨:', review);
            setShowReviewModal(false);
            setSelectedCafe(null);
            // Here you would typically refresh the cafe data
            loadCafes();
          }}
        />
      )}
    </div>
  );
};

export default Index;
