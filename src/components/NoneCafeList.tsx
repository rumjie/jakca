import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Cafe } from '../types/cafe';
import AdBanner from './AdBanner';

interface NoneCafeListProps {
  onWriteReview?: (cafe: Cafe) => void;
  onCafesLoaded?: (cafes: Cafe[]) => void;
}

const fetchFranchiseCafes = async (lat: number, lng: number): Promise<Cafe[]> => {
  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const brands = ['스타벅스', '투썸플레이스', '할리스','이디야','폴바셋','엔제리너스','스터디'];
  let results: Cafe[] = [];

  // 프랜차이즈 3개
  // 랜덤으로 3개의 브랜드 선택
  const randomBrands = [...brands].sort(() => Math.random() - 0.5).slice(0, 3);
  
  for (const brand of randomBrands) {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(brand)}&y=${lat}&x=${lng}&radius=1000`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
      }
    );
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      const item = data.documents[0];
      results.push({
        id: 'kakao-' + item.id,
        name: item.place_name,
        address: item.road_address_name || item.address_name,
        latitude: parseFloat(item.y),
        longitude: parseFloat(item.x),
        distance: Number(item.distance) / 1000, // km로 변환
        rating: 0,
        review_count: 0,
        images: [],
        features: {
          seats: 'many',
          deskHeight: 'mixed',
          outlets: 'many',
          recommended: false,
          wifi: 'good',
          atmosphere: []
        },
        comments: [],
        reviews: [],
        place_url: item.place_url
      });
    }
  }

  // 추가 카페들: 근처 카페 중 여러 개 선택 (프랜차이즈 제외)
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&y=${lat}&x=${lng}&radius=1000&sort=distance&size=10`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    }
  );
  const data = await res.json();
  if (data.documents && data.documents.length > 0) {
    // 최대 6개의 추가 카페 가져오기 (총 9개가 되도록)
    const maxAdditionalCafes = Math.min(6, data.documents.length);
    for (let i = 0; i < maxAdditionalCafes; i++) {
      const item = data.documents[i];
      results.push({
        id: 'kakao-' + item.id + '-' + i,
        name: item.place_name,
        address: item.road_address_name || item.address_name,
        latitude: parseFloat(item.y),
        longitude: parseFloat(item.x),
        distance: Number(item.distance) / 1000, // km로 변환
        rating: 0,
        review_count: 0,
        images: [],
        features: {
          seats: 'many',
          deskHeight: 'mixed',
          outlets: 'many',
          recommended: false,
          wifi: 'good',
          atmosphere: []
        },
        comments: [],
        reviews: [],
        place_url: item.place_url
      });
    }
  }

  return results;
};

const NoneCafeList: React.FC<NoneCafeListProps> = ({ onWriteReview, onCafesLoaded }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (!isMounted) return;
      
      const { latitude, longitude } = pos.coords;
      const data = await fetchFranchiseCafes(latitude, longitude);
      
      if (!isMounted) return;
    
      
      setCafes(data);
      setLoading(false);
      
      // 부모 컴포넌트에 카페 데이터 전달 (무한 루프 방지를 위해 한 번만)
      if (onCafesLoaded && data.length > 0) {
        onCafesLoaded(data);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-2xl mt-12">
        {/* 안내 메시지 */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-lg">
            아직 등록된 이 근처 작카가 없어요! <br />
            이 지역의 첫 번째 리뷰를 남겨주세요. <br />
            전국 어디서든 작카를 찾을 때까지.. ☕️
          </p>
        </div>
        {/* 프랜차이즈 카페 카드 리스트 (처음 3개만 표시) */}
        <div className="flex flex-col items-center space-y-3 mb-4">
          {cafes.slice(0, 3).map((cafe, index) => (
            <div
              key={index}
              className="w-full max-w-md flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{cafe.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {cafe.address}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-gray-500">{cafe.distance}km</span>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  onClick={() => onWriteReview && onWriteReview(cafe)}
                >
                  리뷰쓰기
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* 광고 영역 */}
        <div className="flex justify-center max-h-24 overflow-hidden">
          <AdBanner />
        </div>
      </div>
    </div>
  );
};

export default NoneCafeList; 