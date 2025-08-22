import { Cafe, Review, NewReview } from '../types/cafe';
import { supabase } from '../lib/supabaseClient';
import { v5 as uuidv5 } from 'uuid';
import { getDistanceFromLatLonInMeters } from '../lib/utils';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // 고정 네임스페이스

// 카페 이름과 주소로부터 일관된 UUID 생성
export function getCafeId(name: string, address: string) {
  return uuidv5(`${name}_${address}`, NAMESPACE);
}

// 사용자 ID를 UUID로 변환 (소셜 로그인 ID 처리)
export function convertUserIdToUUID(userId: string): string {
  // 이미 UUID 형식인지 확인
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) {
    return userId;
  }
  
  // 소셜 로그인 ID에서 끝의 UUID 부분 추출
  // 예: "kakao-211064024-0.6983380878505562" -> "0.6983380878505562"
  const parts = userId.split('-');
  if (parts.length >= 3) {
    const uuidPart = parts.slice(-1)[0]; // 마지막 부분
    return uuidPart;
  }
  
  // UUID 부분을 찾을 수 없는 경우 원본 반환
  return userId;
}

// 비-UUID 형태의 카페 ID(kakao-*)를 조회용 UUID로 안정 변환
export function convertCafeIdToUUID(cafeId: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cafeId)) {
    return cafeId;
  }
  // kakao- 등의 비-UUID는 v5로 일관된 UUID 생성
  return uuidv5(cafeId, NAMESPACE);
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
    .filter('latitude', 'gte', lat - 0.0135) // 약 1.5km 반경 (1도 = 약 111km)
    .filter('latitude', 'lte', lat + 0.0135)
    .filter('longitude', 'gte', lng - 0.0169) // 위도에 따라 경도 1도의 거리가 다름
    .filter('longitude', 'lte', lng + 0.0169)
    .gte('rating', 3)
    .limit(4);
  if (error) throw error;
  const cafesWithDistance = (data as Cafe[]).map(cafe => ({
    ...cafe,
    distance: cafe.latitude && cafe.longitude
      ? Math.round(getDistanceFromLatLonInMeters(lat, lng, cafe.latitude, cafe.longitude))
      : null
  }));
  const filteredCafes = cafesWithDistance.filter(cafe => cafe.distance !== null && cafe.distance <= 1500);

  const cafesWithKakao = await Promise.all(
    filteredCafes.map(async (cafe) => {
      const kakaoInfo = await getCafeInfoFromKakao(cafe.name, lng, lat); // x=lng, y=lat
      
      return {
        ...cafe,
        isFromDatabase: true, // DB에서 온 카페 표시 (UI용)
        images: [],
        latitude: cafe.latitude ?? (kakaoInfo ? parseFloat(kakaoInfo.y) : undefined),
        longitude: cafe.longitude ?? (kakaoInfo ? parseFloat(kakaoInfo.x) : undefined),
        // place_url: cafe.place_url ?? kakaoInfo?.place_url,
        // distance: kakaoInfo && kakaoInfo.distance ? Number(kakaoInfo.distance) / 1000 : cafe.distance,
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

  if (import.meta.env.DEV) console.log('kakaoInfo:', data);
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
  let latitude = cafe.latitude;
  let longitude = cafe.longitude;

  // 위/경도 없으면 카카오 API로 채우기
  if (!latitude || !longitude) {
    // x, y는 0, 0 또는 대략적인 위치(예: 서울 중심)로 넣어도 됨
    const kakaoInfo = await getCafeInfoFromKakao(cafe.name, 0, 0);
    if (kakaoInfo) {
      latitude = parseFloat(kakaoInfo.y);
      longitude = parseFloat(kakaoInfo.x);
    }
  }

  const { data, error } = await supabase.from('cafes').insert([
    {
      id: cafeId,
      name: cafe.name,
      address: cafe.address,
      longitude,
      latitude,
      rating: null,
      review_count: 0,
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
export const insertReview = async (cafeId: string, review: NewReview, userId: string, userName: string): Promise<Review> => {
  const today = new Date().toISOString().split('T')[0];
  const time = review.visitTime + ":00:00";


  const { data, error } = await supabase.from('reviews').insert([
    {
      cafe_id: cafeId,
      user_name: userName, 
      user_id: userId,
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
export const submitReviewWithCafeCheck = async (cafe: Cafe, review: NewReview, userId: string, userName: string) => {
  // 1. 카페 이름과 주소로부터 일관된 ID 생성
  const cafeId = getCafeId(cafe.name, cafe.address);

  // 2. 카페가 존재하는지 확인
  const cafeExists = await checkCafeExists(cafeId);

  // 3. 없으면 카페 정보 먼저 추가
  if (!cafeExists) {
    await insertCafe(cafe, cafeId);
  }

  // 4. 리뷰 추가
  const newReview = await insertReview(cafeId, review, userId, userName);

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
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&y=${lat}&x=${lng}&radius=1000&sort=distance&size=15`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    }
  );
  const data = await res.json();
  
  // 랜덤하게 섞어서 다양한 카페 선택
  const shuffledDocuments = [...data.documents].sort(() => Math.random() - 0.5);
  
  return shuffledDocuments.map((item: any, index: number) => ({
    id: 'kakao-' + item.id + '-' + index, // 고유 ID 생성
    name: item.place_name,
    address: item.road_address_name || item.address_name,
    latitude: parseFloat(item.y),
    longitude: parseFloat(item.x),
    distance: item.distance ? Number(item.distance) : null, // distance 추가
    rating: null,
    review_count: 0, // reviewCount → review_count
    isFromDatabase: false, // 카카오 API에서 온 카페
    images: [], // images 필드 추가
    features: {
      seats: 'many',
      deskHeight: 'normal',
      outlets: 'many',
      recommended: false,
      wifi: 'good',
      atmosphere: []
    },
    comments: [],
    reviews: [],
    place_url: item.place_url // 카카오맵 상세페이지
  }));
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
      // 랜덤 인덱스로 다양한 지점 선택 (최대 4개까지)
      const maxIndex = Math.min(data.documents.length - 1, 2);
      const randomIndex = Math.floor(Math.random() * (maxIndex + 1));
      const item = data.documents[randomIndex];
      
      results.push({
        id: 'kakao-' + item.id + '-' + Math.random(), // 고유 ID 생성
        name: item.place_name,
        address: item.road_address_name || item.address_name,
        distance: Number(item.distance),
        rating: 0,
        review_count: 0,
        isFromDatabase: false, // 프랜차이즈 카페는 DB에서 온 것이 아님
        images: [],
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
        latitude: parseFloat(item.y),   // lat → latitude
        longitude: parseFloat(item.x),  // lng → longitude
        place_url: item.place_url,

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
    getCafesFromKakao(lat, lng), // 카카오 API에서 카페 (최소 10개 이상 반환하도록)
    getAllDbCafeKeys() // 모든 DB 카페의 이름+주소 Set
  ]);
  // 2. 카카오 카페에서 DB에 이미 존재하는 카페(점수 무관)는 제외
  const onlyKakao = kakaoCafes.filter(
    c => !allDbCafeKeys.has(`${c.name}-${c.address}`)
  );
  // 3. DB카페 정보 보완(기존 로직)
  const mergedDbCafes = await Promise.all(
    dbCafes.map(async dbCafe => {
      let images: string[] = dbCafe.images && dbCafe.images.length > 0 ? dbCafe.images : [];
      if (import.meta.env.DEV) console.log('images:', images);
      if (images.length === 0) {
        const urls = await getCafeImageUrl(dbCafe.address, dbCafe.name);
        if (urls && urls.length > 0) images = urls;
      }
      const kakaoMatch = kakaoCafes.find(
        k => k.name === dbCafe.name && k.address === dbCafe.address
      );
      return {
        ...dbCafe,
        images,
        distance: dbCafe.distance ?? kakaoMatch?.distance ?? null,
        place_url: dbCafe.place_url ?? kakaoMatch?.place_url,
        latitude: dbCafe.lat ?? kakaoMatch?.lat,
        longitude: dbCafe.lng ?? kakaoMatch?.lng
      };
    })
  );

  // 4. 항상 4개가 되도록 부족한 만큼 onlyKakao에서 추가
  const merged = [...mergedDbCafes, ...onlyKakao];
  if (merged.length >= 4) {
    return merged;
  } else {
    // 부족하면 카카오 API에서 더 받아오거나, onlyKakao에서 더 추가
    // (이미 onlyKakao가 충분히 많도록 getCafesFromKakao에서 size=15~20 등으로 요청하는 것이 중요)
    return merged.concat(onlyKakao.slice(merged.length, 4));
  }
}

// 이미지 어떻게 넣을 것인가 
export async function getCafeImageUrl(cafeAddress: string, cafeName: string): Promise<string[]> {
  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const response = await fetch(
    `https://dapi.kakao.com/v2/search/image?query=${encodeURIComponent(cafeAddress.split(' ').slice(1, 3).join(' ') + ' ' + cafeName)}
    &size=10&sort=recency`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  if (import.meta.env.DEV) console.log('address check:', cafeAddress.split(' ').slice(1, 3).join(' ')); // 시/도, 구까지만 표시
  if (import.meta.env.DEV) console.log('카카오 이미지 응답:', data.documents?.length); 

  return data.documents?.map(doc => doc.image_url) || [];
}

export async function getCafeThumbnail(cafeAddress: string, cafeName: string): Promise<string | undefined> {
  // 1. 카카오 이미지 가져오기 
  const imageUrls = await getCafeImageUrl(cafeAddress, cafeName);
  if (imageUrls.length === 0) return undefined;

  // 2. Gemini API로 이미지 분석하여 최적의 썸네일 선택
  const imageBytes = await Promise.all(
    imageUrls.slice(0, 3).map(async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    })
  );

  const resizedImages = await Promise.all(
    imageBytes.map(async (bytes) => {
      const img = await createImageBitmap(new Blob([bytes]));
      const ratio = Math.min(800 / Math.max(img.width, img.height), 1.0);
      const canvas = new OffscreenCanvas(
        Math.round(img.width * ratio),
        Math.round(img.height * ratio)
      );
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await canvas.convertToBlob({type: 'image/jpeg', quality: 0.85});
      return new Uint8Array(await blob.arrayBuffer());
    })
  );

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {text: "다음 이미지들 중 카페 내부 혹은 위치를 가장 잘 보여주는 이미지 한개만 고르고, index로만 대답해줘"},
            ...resizedImages.map(bytes => ({
              inline_data: {
                mime_type: "image/jpeg",
                data: btoa(String.fromCharCode.apply(null, bytes))
              }
            }))
          ]
        }]
      })
    });

    if (!response.ok) {
      if (import.meta.env.DEV) console.error('Gemini API 호출 실패:', await response.text());
      return imageUrls[0]; // 실패시 첫번째 이미지 반환
    }

    const text = await response.text();
    const index = parseInt(text);
    return !isNaN(index) && index < imageUrls.length ? imageUrls[index] : imageUrls[0];
  } catch (error) {
    if (import.meta.env.DEV) console.error('썸네일 선택 중 에러:', error);
    return imageUrls[0]; // 에러 발생시 첫번째 이미지 반환
  }
}