import { supabase } from '../lib/supabase';
import { Cafe, Review, NewReview } from '../types/cafe';
import { calculateDistance, getCurrentPosition } from '../utils/location';

// Transform database row to Cafe type
const transformCafeData = (cafeRow: any, userLat?: number, userLon?: number): Cafe => {
  const distance = userLat && userLon 
    ? calculateDistance(userLat, userLon, cafeRow.latitude, cafeRow.longitude)
    : 0;

  return {
    id: cafeRow.id,
    name: cafeRow.name,
    address: cafeRow.address,
    distance,
    rating: cafeRow.rating,
    reviewCount: cafeRow.review_count,
    images: cafeRow.images,
    logo: cafeRow.logo,
    features: {
      seats: cafeRow.seats,
      deskHeight: cafeRow.desk_height,
      outlets: cafeRow.outlets,
      wifi: cafeRow.wifi,
      atmosphere: cafeRow.atmosphere,
      timeLimit: cafeRow.time_limit,
      recommended: cafeRow.recommended
    },
    hours: {
      open: cafeRow.open_time,
      close: cafeRow.close_time,
      isOpen: cafeRow.is_open
    },
    priceRange: cafeRow.price_range,
    tags: cafeRow.tags,
    reviews: []
  };
};

// Transform database review row to Review type
const transformReviewData = (reviewRow: any): Review => {
  return {
    id: reviewRow.id,
    userId: reviewRow.user_id,
    userName: reviewRow.user_name,
    rating: reviewRow.rating,
    comment: reviewRow.comment,
    date: new Date(reviewRow.created_at).toISOString().split('T')[0],
    helpful: reviewRow.helpful
  };
};

export const getCafesNearby = async (radius: number = 5): Promise<Cafe[]> => {
  try {
    // Get user's current location
    let userLat = 37.5017; // Default to Gangnam, Seoul
    let userLon = 127.0269;
    
    try {
      const position = await getCurrentPosition();
      userLat = position.coords.latitude;
      userLon = position.coords.longitude;
    } catch (error) {
      console.log('위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
    }

    // Fetch cafes from database
    const { data: cafes, error } = await supabase
      .from('cafes')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('카페 데이터 조회 실패:', error);
      return [];
    }

    if (!cafes || cafes.length === 0) {
      return [];
    }

    // Filter cafes within radius and transform data
    const nearbyCafes = cafes
      .map(cafe => transformCafeData(cafe, userLat, userLon))
      .filter(cafe => cafe.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // Fetch reviews for each cafe
    for (const cafe of nearbyCafes) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('cafe_id', cafe.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviews) {
        cafe.reviews = reviews.map(transformReviewData);
      }
    }

    return nearbyCafes;
  } catch (error) {
    console.error('카페 검색 중 오류 발생:', error);
    return [];
  }
};

export const getNearbySimpleCafes = async () => {
  // This function remains the same as it's used as fallback
  const nearbyyCafes = [
    { name: '스타벅스 강남점', address: '강남구 테헤란로 100', distance: '0.1km' },
    { name: '투썸플레이스 역삼점', address: '강남구 역삼로 200', distance: '0.3km' },
    { name: '커피빈 논현점', address: '강남구 논현로 300', distance: '0.4km' },
    { name: '이디야커피 선릉점', address: '강남구 선릉로 400', distance: '0.5km' },
    { name: '할리스커피 강남센터점', address: '강남구 강남대로 500', distance: '0.6km' }
  ];
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return nearbyyCafes;
};

export const getCafeById = async (id: string): Promise<Cafe> => {
  try {
    const { data: cafe, error } = await supabase
      .from('cafes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !cafe) {
      throw new Error('카페를 찾을 수 없습니다');
    }

    // Get user location for distance calculation
    let userLat = 37.5017;
    let userLon = 127.0269;
    
    try {
      const position = await getCurrentPosition();
      userLat = position.coords.latitude;
      userLon = position.coords.longitude;
    } catch (error) {
      console.log('위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
    }

    const transformedCafe = transformCafeData(cafe, userLat, userLon);

    // Fetch reviews for this cafe
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('cafe_id', id)
      .order('created_at', { ascending: false });

    if (reviews) {
      transformedCafe.reviews = reviews.map(transformReviewData);
    }

    return transformedCafe;
  } catch (error) {
    console.error('카페 상세 정보 조회 실패:', error);
    throw error;
  }
};

export const submitReview = async (cafeId: string, review: NewReview): Promise<Review> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        cafe_id: cafeId,
        user_id: 'current_user', // In real app, get from auth
        user_name: '사용자', // In real app, get from user profile
        rating: review.rating,
        comment: review.comment,
        purpose: review.purpose,
        quietness: review.features.quietness,
        comfort: review.features.comfort,
        wifi: review.features.wifi,
        outlets: review.features.outlets
      })
      .select()
      .single();

    if (error) {
      throw new Error('리뷰 저장에 실패했습니다');
    }

    // Update cafe's average rating and review count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('cafe_id', cafeId);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const roundedRating = Math.round(avgRating * 10) / 10;

      await supabase
        .from('cafes')
        .update({ 
          rating: roundedRating, 
          review_count: allReviews.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', cafeId);
    }

    return transformReviewData(data);
  } catch (error) {
    console.error('리뷰 제출 실패:', error);
    throw error;
  }
};
