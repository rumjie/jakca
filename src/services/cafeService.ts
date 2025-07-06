import { Cafe, Review, NewReview } from '../types/cafe';
import { supabase } from '../lib/supabaseClient';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // 고정 네임스페이스

// 카페 이름과 주소로부터 일관된 UUID 생성
export function getCafeId(name: string, address: string) {
  return uuidv5(`${name}_${address}`, NAMESPACE);
}

// 카카오 장소 검색 API로 카페 정보 가져오기 (x, y 활용, distance 반환)
async function getCafeInfoFromKakao(name: string, x: number, y: number): Promise<any | null> {
  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  let url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(name)}&x=${x}&y=${y}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
  });
  const data = await res.json();
  if (data.documents && data.documents.length > 0) {
    return data.documents[0];
  }
  return null;
}

export const getCafesNearby = async (lat: number, lng: number): Promise<Cafe[]> => {
  if (lat === undefined || lng === undefined) {
    throw new Error('위치 정보가 필요합니다.');
  }
  const { data, error } = await supabase
    .from('cafes')
    .select('*')
    .gte('rating', 3)
    .limit(4);
  if (error) throw error;
  
  const cafesWithKakao = await Promise.all(
    (data as Cafe[]).map(async (cafe) => {
      const kakaoInfo = await getCafeInfoFromKakao(cafe.name, lng, lat); // x=lng, y=lat
      
      return {
        ...cafe,
        isFromDatabase: true, // DB에서 온 카페 표시 (UI용)
        images: [getCafeImage()],
        lat: cafe.lat ?? (kakaoInfo ? parseFloat(kakaoInfo.y) : undefined),
        lng: cafe.lng ?? (kakaoInfo ? parseFloat(kakaoInfo.x) : undefined),
        // place_url: cafe.place_url ?? kakaoInfo?.place_url,
        distance: kakaoInfo && kakaoInfo.distance ? Number(kakaoInfo.distance) / 1000 : cafe.distance,
      };
    })
  );

  // DB 카페가 4개 미만이면 프랜차이즈 카페 추가
  if (cafesWithKakao.length < 4) {
    const franchiseCafes = await getFranchiseCafes(lat, lng);
    
    // 중복 제거: DB 카페와 이름+주소가 같은 프랜차이즈 카페 제외
    const dbCafeKeys = new Set(cafesWithKakao.map(cafe => `${cafe.name}-${cafe.address}`));
    const uniqueFranchiseCafes = franchiseCafes.filter(cafe => 
      !dbCafeKeys.has(`${cafe.name}-${cafe.address}`)
    );
    
    const neededCount = 4 - cafesWithKakao.length;
    const additionalCafes = uniqueFranchiseCafes.slice(0, neededCount);
    
    return [...cafesWithKakao, ...additionalCafes];
  }

  console.log('kakaoInfo:', data);
  return cafesWithKakao;
};

export const getCafeById = async (id: string): Promise<Cafe> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const { data, error } = await supabase
    .from('cafes')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) {
    throw new Error('Cafe not found');
  }
  return data as Cafe;
};

// 카페 존재 여부 확인
export const checkCafeExists = async (cafeId: string) => {
  const { data, error } = await supabase
    .from('cafes')
    .select('id')
    .eq('id', cafeId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return !!data; // true: 존재, false: 없음
};

// 카페 정보 추가
export const insertCafe = async (cafe: Cafe, cafeId: string) => {
  const { data, error } = await supabase.from('cafes').insert([
    {
      id: cafeId,
      name: cafe.name,
      address: cafe.address,
      rating: null, // 초기값은 null
      review_count: 0, // 초기값은 0
      images: cafe.images,
      features: cafe.features,
      comments: cafe.comments,
      // isFromDatabase는 UI에서만 사용하므로 DB에 저장하지 않음
    }
  ]);
  if (error) throw error;
  return data;
};

// 리뷰 추가
export const insertReview = async (cafeId: string, review: NewReview): Promise<Review> => {
  const today = new Date().toISOString().split('T')[0];
  const time = review.visitTime + ":00:00";

  const { data, error } = await supabase.from('reviews').insert([
    {
      cafe_id: cafeId,
      user_name: "test", 
      user_id: uuidv5("test", NAMESPACE),
      rating: review.rating,
      comment: review.comment,
      date: today,
      purpose: review.purpose,
      features: review.features,
      atmosphere: review.atmosphere,
      visit_date: review.visitDate,
      visit_time: time,
      stay_duration: review.stayDuration,
      price_satisfaction: review.priceSatisfaction,
      overall_satisfaction: review.overallSatisfaction
    }
  ]).select().single();

  if (error) {
    throw error;
  }
  return data as Review;
};

// 카페 정보 업데이트 (리뷰 추가 후)
export const updateCafeAfterReview = async (cafeId: string, review: NewReview) => {
  // 1. 해당 카페의 모든 리뷰 평점 평균 계산
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('cafe_id', cafeId);

  if (reviewsError) throw reviewsError;

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  // 2. 카페 정보 업데이트
  const { error: updateError } = await supabase
    .from('cafes')
    .update({
      rating: avgRating,
      review_count: reviews.length,
      // features와 comments는 필요에 따라 업데이트
      features: [review.features], // 최신 리뷰의 features에 배열 추가
      comments: [review.comment] // 최신 리뷰의 comment를 comments 배열에 추가
    })
    .eq('id', cafeId);

  if (updateError) throw updateError;
};

// 메인 함수: 카페 확인 후 리뷰 저장
export const submitReviewWithCafeCheck = async (cafe: Cafe, review: NewReview) => {
  // 1. 카페 이름과 주소로부터 일관된 ID 생성
  const cafeId = getCafeId(cafe.name, cafe.address);

  // 2. 카페가 존재하는지 확인
  const cafeExists = await checkCafeExists(cafeId);

  // 3. 없으면 카페 정보 먼저 추가
  if (!cafeExists) {
    await insertCafe(cafe, cafeId);
  }

  // 4. 리뷰 추가
  const newReview = await insertReview(cafeId, review);

  // 5. 카페 정보 업데이트 (rating, review_count, features, comments)
  await updateCafeAfterReview(cafeId, review);

  return newReview;
};

// DB에서 카페 가져오기
export async function getCafesFromDB(): Promise<Cafe[]> {
  // ...supabase 쿼리
  return [];
}

// 간단한 메모리 캐시
const cache = new Map<string, {data: any, timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

async function getCafesFromKakaoWithCache(lat: number, lng: number) {
  const key = `kakao-${lat}-${lng}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await getCafesFromKakao(lat, lng);
  cache.set(key, {data, timestamp: Date.now()});
  return data;
}

// 카카오 API에서 카페 가져오기
export async function getCafesFromKakao(lat: number, lng: number): Promise<Cafe[]> {
  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&y=${lat}&x=${lng}&radius=1000&sort=distance`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    }
  );
  const data = await res.json();
  return data.documents.map((item: any) => ({
    id: 'kakao-' + item.id,
    name: item.place_name,
    address: item.road_address_name || item.address_name,
    lat: parseFloat(item.y),
    lng: parseFloat(item.x),
    distance: item.distance ? Number(item.distance) / 1000 : null, // km
    rating: null,
    reviewCount: 0,
    isFromDatabase: false, // 카카오 API에서 온 카페
    // images: getCafeImage(), // 대표 이미지
    features: {},
    comments: [],
    reviews: [],
    place_url: item.place_url // 카카오맵 상세페이지
  }));
}

// 대표 이미지 예시 (Unsplash 랜덤)
function getCafeImage() {
  // 다양한 카페 관련 이미지를 랜덤하게 보여줌
  return 'https://source.unsplash.com/featured/?cafe,coffee,interior,workspace,study';
}

// 프랜차이즈 카페 가져오기
async function getFranchiseCafes(lat: number, lng: number): Promise<Cafe[]> {
  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const brands = ['스타벅스', '투썸플레이스', '할리스','이디야','폴바셋','엔제리너스','스터디'];
  let results: Cafe[] = [];

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
        review_count: 0,
        isFromDatabase: false, // 프랜차이즈 카페는 DB에서 온 것이 아님
        images: [getCafeImage()],
        features: {
          seats: null,
          deskHeight: null,
          outlets: null,
          recommended: false,
          wifi: null,
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

  return results;
}

// DB에 존재하는 모든 카페의 이름+주소 목록 반환
async function getAllDbCafeKeys(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('cafes')
    .select('name, address');
  if (error) throw error;
  return new Set((data as {name: string, address: string}[]).map(c => `${c.name}-${c.address}`));
}

// 두 소스 통합
export async function getNearbyCafes(lat: number, lng: number): Promise<Cafe[]> {
  const [dbCafes, kakaoCafes, allDbCafeKeys] = await Promise.all([
    getCafesNearby(lat, lng), // DB에서 rating 3 이상 카페
    getCafesFromKakao(lat, lng), // 카카오 API에서 카페
    getAllDbCafeKeys() // 모든 DB 카페의 이름+주소 Set
  ]);
  // 2. 카카오 카페에서 DB에 이미 존재하는 카페(점수 무관)는 제외
  const onlyKakao = kakaoCafes.filter(
    c => !allDbCafeKeys.has(`${c.name}-${c.address}`)
  );
  // 3. DB카페 정보 보완(기존 로직)
  const mergedDbCafes = dbCafes.map(dbCafe => {
    const kakaoMatch = kakaoCafes.find(
      k => k.name === dbCafe.name && k.address === dbCafe.address
    );
    return {
      ...dbCafe,
      images: dbCafe.images && dbCafe.images.length > 0 ? dbCafe.images : kakaoMatch?.images || [],
      distance: dbCafe.distance ?? kakaoMatch?.distance ?? null,
      place_url: dbCafe.place_url ?? kakaoMatch?.place_url,
      lat: dbCafe.lat ?? kakaoMatch?.lat,
      lng: dbCafe.lng ?? kakaoMatch?.lng
    };
  });
  return [...mergedDbCafes, ...onlyKakao];
}
