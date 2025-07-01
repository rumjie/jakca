import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Wifi, Zap, Users, Star, Plus } from 'lucide-react';
import CafeCard from '../components/CafeCard';
import CafeDetail from '../components/CafeDetail';
import ReviewModal from '../components/ReviewModal';
import AdBanner from '../components/AdBanner';
// import { getCafesNearby, getCafeById } from '../services/cafeService';
import SimpleCafeList from '../components/SimpleCafeList';
import { getCafesNearby, getCafeById, getCafesNearby2 } from '../services/cafeService';
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // console.log('위치 정보:', latitude, longitude);
          const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
          try {
            const response = await fetch(
              `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
              {
                headers: {
                  Authorization: `KakaoAK ${KAKAO_API_KEY}`,
                },
              }
            );
            const data = await response.json();

            let address = '내 위치';
            if (data.documents && data.documents.length > 0) {
              const addrObj = data.documents[0].address;
              if (addrObj) {
                address = `${addrObj.region_2depth_name} ${addrObj.region_3depth_name}`;
              } else {
                // fallback: address_name에서 구, 동만 추출
                const fullAddress = data.documents[0].address?.address_name || '내 위치';
                const arr = fullAddress.split(' ');
                address = arr.length >= 3 ? `${arr[1]} ${arr[2]}` : fullAddress;
              }
            }
            setUserLocation(address);
          } catch (e) {
            console.error('카카오 역지오코딩 실패:', e);
            setUserLocation('내 위치');
          }
          loadCafes();
        },
        (error) => {
          console.error('위치 정보 에러:', error);
          setUserLocation('위치 정보 없음');
          loadCafes();
        }
      );
    } else {
      setUserLocation('위치 정보 없음');
      loadCafes();
    }
  }, []);

  const loadCafes = async () => {
    try {
      setLoading(true);
      const nearbyeCafes = await getCafesNearby();
      // setCafes(nearbyeCafes);
            
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

  const handleRefresh = async () => {
    setLoading(true);
    const newCafes = await getCafesNearby2();
    setCafes(newCafes);
    setLoading(false);
    // window.location.reload();
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
              <h1 className="text-2xl font-bold text-gray-900">JAKCA - 작업하기 좋은 카페 찾기</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {userLocation}
              </div>
            </div>
            <div className="bg-orange-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-orange-800">
                Developed by{' '}
                <a
                  href="https://github.com/rumjie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-orange-600"
                >
                  RUMJIE
                </a>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">알림: 프로토타입 페이지입니다</h2>
              </div>

              {/* Cafe List */}
              <div className="grid grid-cols-2 gap-4">
                {cafes.map((cafe, index) => (
                  <div key={cafe.id} className="contents">
                    <CafeCard
                      cafe={cafe}
                      onClick={() => handleCafeClick(cafe.id)}
                      onWriteReview={() => handleWriteReview(cafe)}
                    />
                    {/* Ad Banner after 2nd cafe */}
                    {index === 1 && (
                      <div className="col-span-2">
                        <AdBanner />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center py-6">
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full border border-gray-200 font-medium transition-colors" onClick={handleRefresh}>
                 목록 새로고침
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
