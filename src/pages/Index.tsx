import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Wifi, Zap, Users, Star, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '@/components/auth/UserProfile';

import CafeCard from '../components/CafeCard';
import CafeDetail from '../components/CafeDetail';
import ReviewModal from '../components/ReviewModal';
import AdBanner from '../components/AdBanner';
import NoneCafeList from '../components/NoneCafeList';
import LoginModal from '../components/LoginModal';
import UserMenu from '../components/UserMenu';
import { getCafesNearby, getCafeById, getNearbyCafes } from '../services/cafeService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

import { Cafe } from '../types/cafe';

const Index = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showSimpleList, setShowSimpleList] = useState(false);
  const [showCafeListSheet, setShowCafeListSheet] = useState(false); // 슬라이드업 토글 상태 추가
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { user } = useAuth();

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

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
          console.error('위치 정보 에러 상세:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.code === 1,
            POSITION_UNAVAILABLE: error.code === 2,
            TIMEOUT: error.code === 3
          });
          
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
          
          console.log('기본 위치로 대체:', defaultLocation);
          setUserLocation(defaultLocation);
          loadCafes(defaultLocation.lat, defaultLocation.lng);
          
          // 사용자에게 안내 (선택사항)
          if (error.code === 2) {
            console.warn('💡 위치 정보를 사용할 수 없습니다. 네트워크 연결과 GPS 신호를 확인해주세요.');
          }
        }
      );
    } else {
      setUserLocation(null);
      loadCafes();
    }
  }, []);

  useEffect(() => {
    if (!showCafeListSheet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCafeListSheet(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCafeListSheet]);

  const loadCafes = async (userLat?: number, userLng?: number) => {
    try {
      setLoading(true);
      let cafesWithDistance: Cafe[] = [];
      if (userLat !== undefined && userLng !== undefined) {
        cafesWithDistance = await getNearbyCafes(userLat, userLng);
      } else {
        cafesWithDistance = await getCafesNearby(userLat, userLng);
      }
      
      // 모든 카페 저장 (드롭다운용)
      setAllCafes(cafesWithDistance);
      
      // DB 카페만 필터링 (isFromDatabase가 true인 카페들)
      const dbCafes = cafesWithDistance.filter(cafe => cafe.isFromDatabase);

      if (dbCafes.length === 0) {
        // DB 카페가 0개면 SimpleCafeList 표시 (카카오 API 카페들)
        setShowSimpleList(true);
        setCafes(cafesWithDistance); // 카카오 API 카페들도 저장
      } else {
        // DB 카페가 1개 이상이면 기존 로직대로 진행
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

  const handleDropdownCafeSelect = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // 첫 페이지용 카페 (4개만 표시)
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

  // 바텀시트용 카페 (첫 페이지에 표시되지 않는 나머지 카페들)
  const bottomSheetCafes = showSimpleList 
    ? cafes.slice(3) // SimpleCafeList에서는 3번째 이후부터
    : cafes.filter(
        cafe => {
          return true;
        }
      ).slice(4); // 기존 로직에서는 4번째 이후부터


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
            <div className="flex items-center space-x-4">

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
              
              {/* 인증 상태에 따른 버튼 표시 */}
              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <UserProfile />
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/auth')}
                      >
                        로그인/회원가입
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {/* 알림: 항상 표시 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900 mb-4 text-center"> 🧑🏻‍💻☕️  <br /> 
            작업하기 좋은 카페를 찾아서, 작카! <br />
            내 주변의 공부, 독서, 미팅, 작업하기 좋은 카페를 추천해드립니다. <br />
            개선 의견이 있으시다면 github의 연락처를 참고해주세요 💕 <br />
            <span className="text-sm">버전 정보: 1.0.0 / last updated: 2025-07-21</span>
            </h2>
          </div>

          {/* 근처 카페 드롭다운 */}
          {/* {allCafes.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">근처 모든 카페</h3>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                  <span className="text-gray-700">카페 목록 보기</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                  {allCafes.map((cafe) => (
                    <DropdownMenuItem
                      key={cafe.id}
                      onClick={() => handleDropdownCafeSelect(cafe)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{cafe.name}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {cafe.address}
                        </div>
                        {cafe.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-600">{cafe.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {cafe.distance && (
                        <span className="text-sm text-gray-500 ml-2">
                          {cafe.distance < 1000 ? `${cafe.distance}m` : `${(cafe.distance / 1000).toFixed(1)}km`}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )} */}

          {/* 카페 리스트 or NoneCafeList */}
          {!showSimpleList ? (
            <>
              {/* Cafe List */}
              <div className="grid grid-cols-2 gap-4">
                {filteredCafes.length > 0 ? (
                  filteredCafes.map((cafe, index) => [
                    <CafeCard
                      key={cafe.id}
                      cafe={cafe}
                      onClick={() => handleCafeClick(cafe.id)}
                      onWriteReview={() => handleWriteReview(cafe)}
                      isFromDatabase={cafe.isFromDatabase}
                    />,
                    index === 1 && (
                      <div key="ad-banner" className="col-span-2 flex justify-center">
                        <AdBanner />
                      </div>
                    )
                  ])
                ) : (
                  <>
                    <NoneCafeList onWriteReview={handleNoneCafeWriteReview} />
                    <div className="flex justify-center mt-4">
                      <AdBanner />
                    </div>

                  </>
                )}
              </div>

            </>
          ) : (
            <>
              <SimpleCafeList 
                cafes={cafes.slice(0, 3).map(cafe => ({
                  name: cafe.name,
                  address: cafe.address,
                  distance: `${cafe.distance}m`
                }))} 
                onWriteReview={(simpleCafe) => {
                  const cafe = cafes.find(c => c.name === simpleCafe.name && c.address === simpleCafe.address);
                  if (cafe) {
                    handleWriteReview(cafe);
                  }
                }}
              />
            </>
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

      {/* 하단 토글 버튼 */}
      {!showReviewModal && (
        <button
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg z-50"
          onClick={() => setShowCafeListSheet(v => !v)}
        >
          {showCafeListSheet ? '카페 목록 닫기' : '근처 카페 보기'}
        </button>
      )}

      {/* 슬라이드업 바텀시트 */}
      {showCafeListSheet && (
        <div
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-5/6 sm:w-2/5 bg-white rounded-t-2xl shadow-lg max-h-[280px] overflow-y-auto p-4 z-40 border-t border-gray-200 mb-20"
        >
          {bottomSheetCafes.length === 0 ? (
            <div className="text-center text-gray-500">더 이상 표시할 카페가 없습니다.</div>
          ) : (
            // 바텀시트용 카페들 표시 (첫 페이지에 표시되지 않는 카페들)
            bottomSheetCafes.map(cafe => (
                <div key={cafe.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <div className="font-bold truncate max-w-[80vw] sm:max-w-[160px]">{cafe.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[80vw] sm:max-w-[200px]">{cafe.address}</div>
                  </div>
                  <button
                    className="bg-orange-500 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelectedCafe(cafe);
                      setShowReviewModal(true);
                    }}
                  >
                    리뷰 쓰기
                  </button>
                </div>
              ))
          )}
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default Index;
