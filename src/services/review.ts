import { supabase } from '@/lib/supabaseClient';
import type { Review, LikedCafe } from '@/types/review';
import { convertUserIdToUUID } from './cafeService';

export class ReviewService {
  // 사용자가 작성한 리뷰 목록 가져오기
  static async getUserReviews(userId: string): Promise<{ reviews: Review[]; error: any }> {
    try {
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          user_id,
          cafe_id,
          comment,
          rating,
          date,
          cafes!inner (
            name
          )
        `)
        .eq('user_id', uuidUserId)
        .order('date', { ascending: false });

      if (error) {
        console.error('사용자 리뷰 조회 오류:', error);
        return { reviews: [], error };
      }

      // 데이터 구조 변환
      const formattedReviews: Review[] = reviews.map((review: any) => ({
        user_id: review.user_id,
        cafe_id: review.cafe_id,
        cafe_name: review.cafes.name,
        comment: review.comment,
        rating: review.rating,
        date: review.date
      }));

      return { reviews: formattedReviews, error: null };
    } catch (error) {
      console.error('사용자 리뷰 조회 중 오류:', error);
      return { reviews: [], error };
    }
  }

  // 사용자가 좋아요한 카페 목록 가져오기
  static async getUserLikedCafes(userId: string): Promise<{ cafes: LikedCafe[]; error: any }> {
    try {
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      
      const { data: likes, error } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          cafes!inner (
            id,
            name,
            address,
            rating
          )
        `)
        .eq('user_id', uuidUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('사용자 좋아요 카페 조회 오류:', error);
        return { cafes: [], error };
      }

      // 데이터 구조 변환
      const formattedCafes: LikedCafe[] = likes.map((like: any) => ({
        id: like.cafes.id,
        name: like.cafes.name,
        address: like.cafes.address,
        rating: like.cafes.rating,
        liked_at: like.created_at
      }));

      return { cafes: formattedCafes, error: null };
    } catch (error) {
      console.error('사용자 좋아요 카페 조회 중 오류:', error);
      return { cafes: [], error };
    }
  }

  // 리뷰 삭제 (user_id와 cafe_id로 식별)
  static async deleteReview(cafeId: string, userId: string): Promise<{ error: any }> {
    try {
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('cafe_id', cafeId)
        .eq('user_id', uuidUserId); // 본인이 작성한 리뷰만 삭제 가능

      if (error) {
        console.error('리뷰 삭제 오류:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('리뷰 삭제 중 오류:', error);
      return { error };
    }
  }

  // 좋아요 취소
  static async unlikeCafe(cafeId: string, userId: string): Promise<{ error: any }> {
    try {
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('cafe_id', cafeId)
        .eq('user_id', uuidUserId);

      if (error) {
        console.error('좋아요 취소 오류:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('좋아요 취소 중 오류:', error);
      return { error };
    }
  }
} 