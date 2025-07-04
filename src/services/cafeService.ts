import { Cafe, Review, NewReview } from '../types/cafe';
import { supabase } from '../lib/supabaseClient';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // 고정 네임스페이스

// 카페 이름과 주소로부터 일관된 UUID 생성
export function getCafeId(name: string, address: string) {
  return uuidv5(`${name}_${address}`, NAMESPACE);
}

export const getCafesNearby = async (): Promise<Cafe[]> => {
  const { data, error } = await supabase
    .from('cafes')
    .select('*')
    .limit(4);
  if (error) throw error;
  console.log('DB에서 받아온 카페 데이터:', data);
  return data as Cafe[];
};


export const getCafeById = async (id: string): Promise<Cafe> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!cafe) {
    throw new Error('Cafe not found');
  }
  return cafe;
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
      hours: cafe.hours,
      comments: cafe.comments,
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
    images: [getCafeImage(item.place_name, item.road_address_name || item.address_name)], // 대표 이미지
    features: {},
    hours: {}, // 영업시간은 별도 크롤링 필요
    comments: [],
    reviews: [],
    place_url: item.place_url // 카카오맵 상세페이지
  }));
}

// 대표 이미지 예시 (Unsplash 랜덤)
function getCafeImage(name: string, address: string) {
  // 실제 서비스에서는 더 정교한 이미지 매칭 필요
  return `https://source.unsplash.com/featured/?cafe,coffee,${encodeURIComponent(name)}`;
}

// 두 소스 통합
export async function getNearbyCafes(lat: number, lng: number): Promise<Cafe[]> {
  const [dbCafes, kakaoCafes] = await Promise.all([
    getCafesFromDB(),
    getCafesFromKakao(lat, lng)
  ]);
  // 중복 제거 및 병합
  return mergeCafeLists(dbCafes, kakaoCafes);
}

function mergeCafeLists(dbCafes: Cafe[], kakaoCafes: Cafe[]): Cafe[] {
  const dbKeySet = new Set(dbCafes.map(c => c.name + c.address));
  const onlyKakao = kakaoCafes.filter(
    c => !dbKeySet.has(c.name + c.address)
  );
  // DB 카페에 없는 필드 보완
  const mergedDbCafes = dbCafes.map(dbCafe => {
    const kakaoMatch = kakaoCafes.find(
      k => k.name === dbCafe.name && k.address === dbCafe.address
    );
    return {
      ...dbCafe,
      images: dbCafe.images && dbCafe.images.length > 0 ? dbCafe.images : kakaoMatch?.images || [],
      distance: dbCafe.distance ?? kakaoMatch?.distance ?? null,
      hours: dbCafe.hours && dbCafe.hours.open ? dbCafe.hours : kakaoMatch?.hours || { open: '', close: '', isOpen: false },
      place_url: dbCafe.place_url ?? kakaoMatch?.place_url,
      lat: dbCafe.lat ?? kakaoMatch?.lat,
      lng: dbCafe.lng ?? kakaoMatch?.lng
    };
  });
  return [...mergedDbCafes, ...onlyKakao];
}
