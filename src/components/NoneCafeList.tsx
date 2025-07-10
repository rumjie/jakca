import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Cafe } from '../types/cafe';

interface NoneCafeListProps {
  onWriteReview?: (cafe: Cafe) => void;
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
        distance: Number(item.distance) / 1000, // km로 변환
        rating: 0,
        reviewCount: 0,
        images: [],
        features: {
          seats: 'many',
          deskHeight: 'mixed',
          outlets: 'many',
          recommended: false,
          wifi: 'excellent',
          atmosphere: []
        },
        comments: [],
        reviews: [],
        lat: parseFloat(item.y),
        lng: parseFloat(item.x),
        place_url: item.place_url
      });
    }
  }

  // 네 번째: 근처 카페 중 랜덤으로 하나 선택 (프랜차이즈 제외)
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&y=${lat}&x=${lng}&radius=1000&sort=distance`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    }
  );
  const data = await res.json();
  if (data.documents) {
    const randomIndex = Math.floor(Math.random() * data.documents.length);
    const item = data.documents[randomIndex];
    results.push({
      id: 'kakao-' + item.id,
      name: item.place_name,
      address: item.road_address_name || item.address_name,
      distance: Number(item.distance) / 1000, // km로 변환
      rating: 0,
      reviewCount: 0,
      images: [],
      features: {
        seats: 'many',
        deskHeight: 'mixed',
        outlets: 'many',
        recommended: false,
        wifi: 'excellent',
        atmosphere: []
      },
      hours: {
        open: '',
        close: '',
        isOpen: false
      },
      comments: [],
      reviews: [],
      lat: parseFloat(item.y),
      lng: parseFloat(item.x),
      place_url: item.place_url
    });
  }

  return results;
};

const NoneCafeList: React.FC<NoneCafeListProps> = ({ onWriteReview }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const data = await fetchFranchiseCafes(latitude, longitude);
      setCafes(data);
      setLoading(false);
    });
  }, []);

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
        {/* 프랜차이즈/카카오 카페 카드 리스트 */}
        <div className="flex flex-col items-center space-y-3">
          {cafes.map((cafe, index) => (
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
      </div>
    </div>
  );
};

export default NoneCafeList; 