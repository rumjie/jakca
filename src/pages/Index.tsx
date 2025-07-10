import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Wifi, Zap, Users, Star, Plus } from 'lucide-react';
import CafeCard from '../components/CafeCard';
import CafeDetail from '../components/CafeDetail';
import ReviewModal from '../components/ReviewModal';
import AdBanner from '../components/AdBanner';
import NoneCafeList from '../components/NoneCafeList';
import { getCafesNearby, getCafeById, getNearbyCafes } from '../services/cafeService';
import { Cafe } from '../types/cafe';
// import { SimpleCafe } from '../types/simpleCafe';

const Index = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showSimpleList, setShowSimpleList] = useState(false);

  // getDistanceFromLatLonInKm, simpleCafeToCafe 임시 함수 추가
  function getDistanceFromLatLonInKm() { return 0; }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('위치 정보:', latitude, longitude);
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
            // console.log('카카오 API 응답:', data); // 디버깅용

            let address = '내 위치';
            if (data.documents && data.documents.length > 0) {
              const document = data.documents[0];
              
              // address 객체가 있는 경우
              if (document.address) {
                const addrObj = document.address;
                if (addrObj.region_2depth_name && addrObj.region_3depth_name) {
                  address = `${addrObj.region_2depth_name} ${addrObj.region_3depth_name}`;
                } else if (addrObj.address_name) {
                  // address_name에서 구, 동 추출
                  const addrParts = addrObj.address_name.split(' ');
                  if (addrParts.length >= 3) {
                    address = `${addrParts[1]} ${addrParts[2]}`;
                  } else {
                    address = addrObj.address_name;
                  }
                }
              }
              // road_address 객체가 있는 경우 (도로명 주소)
              else if (document.road_address) {
                const roadAddr = document.road_address;
                if (roadAddr.region_2depth_name && roadAddr.region_3depth_name) {
                  address = `${roadAddr.region_2depth_name} ${roadAddr.region_3depth_name}`;
                } else if (roadAddr.address_name) {
                  const addrParts = roadAddr.address_name.split(' ');
                  if (addrParts.length >= 3) {
                    address = `${addrParts[1]} ${addrParts[2]}`;
                  } else {
                    address = roadAddr.address_name;
                  }
                }
              }
            }
            setUserLocation({ lat: latitude, lng: longitude, address });
          } catch (e) {
            console.error('카카오 역지오코딩 실패:', e);
            setUserLocation(null);
          }
          loadCafes(latitude, longitude);
        },
        (error) => {
          console.error('위치 정보 에러:', error);
          
          // 에러 코드별 메시지
          let errorMessage = '위치 정보를 가져올 수 없습니다';
          switch (error.code) {
            case 1:
              errorMessage = '위치 정보 접근이 거부되었습니다';
              break;
            case 2:
              errorMessage = '위치 정보를 사용할 수 없습니다';
              break;
            case 3:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다';
              break;
          }
          
          // 기본 위치로 설정 (서울 시청)
          const defaultLocation = {
            lat: 37.5665,
            lng: 126.9780,
            address: '서울 중구'
          };
          
          setUserLocation(defaultLocation);
          loadCafes(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      setUserLocation(null);
      loadCafes();
    }
  }, []);

  const loadCafes = async (userLat?: number, userLng?: number) => {
    try {
      setLoading(true);
      let cafesWithDistance: Cafe[] = [];
      if (userLat !== undefined && userLng !== undefined) {
        cafesWithDistance = await getNearbyCafes(userLat, userLng);
      } else {
        cafesWithDistance = await getCafesNearby(userLat, userLng);
      }
      if (cafesWithDistance.length === 0) {
        setShowSimpleList(true);
        setCafes([]);
      } else {
        setCafes(cafesWithDistance);
        setShowSimpleList(false);
      }
    } catch (error) {
      console.error('카페 데이터 로딩 실패:', error);
      setShowSimpleList(true);
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCafeClick = async (cafeId: string) => {
    try {
      // 먼저 현재 리스트에서 카페 찾기
      const cafeFromList = cafes.find(cafe => cafe.id === cafeId);
      if (cafeFromList) {
        setSelectedCafe(cafeFromList);
        return;
      }
      
      // 리스트에 없으면 DB에서 찾기
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
    const newCafes = await getCafesNearby(userLocation?.lat, userLocation?.lng);
    setCafes(newCafes);
    setLoading(false);
    // window.location.reload();
  };

  const handleNoneCafeWriteReview = (cafe: Cafe) => {
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

  const filteredCafes = cafes.filter(
    cafe => {
      // DB에서 온 카페는 rating 3 이상만 표시
      if (cafe.isFromDatabase) {
        return typeof cafe.rating === 'number' && cafe.rating >= 3;
      }
      // 프랜차이즈나 카카오 API 카페는 모두 표시
      return true;
    }
  ).slice(0, 4); // 최대 4개만 표시


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
                {userLocation?.address}
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
          {/* 알림: 항상 표시 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">알림: 프로토타입 페이지입니다</h2>
          </div>

          {/* 카페 리스트 or NoneCafeList */}
          {!showSimpleList ? (
            <>
              {/* Cafe List */}
              <div className="grid grid-cols-2 gap-4">
                {filteredCafes.length > 0 ? (
                  filteredCafes.map((cafe, index) => (
                    <div key={cafe.id} className="contents">
                      <CafeCard
                        cafe={cafe}
                        onClick={() => handleCafeClick(cafe.id)}
                        onWriteReview={() => handleWriteReview(cafe)}
                        isFromDatabase={cafe.isFromDatabase}
                      />
                      {/* Ad Banner after 2nd cafe */}
                      {index === 1 && (
                        <div className="col-span-2">
                          <AdBanner />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <NoneCafeList onWriteReview={handleNoneCafeWriteReview} />
                )}
              </div>

              {/* Load More Button */}
              <div className="text-center py-6">
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full border border-gray-200 font-medium transition-colors" onClick={handleRefresh}>
                 목록 새로고침
                </button>
              </div>
            </>
          ) : (
            <NoneCafeList onWriteReview={handleNoneCafeWriteReview} />
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
            setShowReviewModal(false);
            setSelectedCafe(null);
            // 현재 위치 정보를 전달
            loadCafes(userLocation?.lat, userLocation?.lng);
          }}
        />
      )}
    </div>
  );
};

export default Index;
