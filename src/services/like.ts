import { supabase } from '@/lib/supabaseClient';
import type { Like, LikeStatus } from '@/types/like';
import { convertUserIdToUUID } from './cafeService';
import { convertCafeIdToUUID } from './cafeService';

export class LikeService {
  // 사용자의 특정 카페 좋아요 상태 확인
  static async getLikeStatus(userId: string, cafeId: string): Promise<{ status: LikeStatus; error: any }> {
    try {
      console.log('좋아요 상태 확인 - userId:', userId, 'cafeId:', cafeId);
      
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      // 카페 ID를 조회용 UUID로 변환
      const uuidCafeId = convertCafeIdToUUID(cafeId);

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', uuidUserId)
        .eq('cafe_id', uuidCafeId)
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('좋아요 상태 확인 오류:', error);
        return { status: { isLiked: false }, error };
      }

      const likeRow = Array.isArray(data) ? data[0] : data;
      return {
        status: {
          isLiked: !!likeRow,
          likeId: likeRow?.id,
        },
        error: null,
      };
    } catch (error) {
      console.error('좋아요 상태 확인 중 오류:', error);
      return { status: { isLiked: false }, error };
    }
  }

  // 좋아요 추가
  static async addLike(userId: string, cafeId: string): Promise<{ like: Like | null; error: any }> {
    try {
      console.log('좋아요 추가 - userId:', userId, 'cafeId:', cafeId);
      
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      // 카페 ID를 조회용 UUID로 변환
      const uuidCafeId = convertCafeIdToUUID(cafeId);

      const { data: like, error } = await supabase
        .from('likes')
        .insert([{
          user_id: uuidUserId,
          cafe_id: uuidCafeId
        }])
        .select()
        .single();

      if (error) {
        console.error('좋아요 추가 오류:', error);
        return { like: null, error };
      }

      return { like, error: null };
    } catch (error) {
      console.error('좋아요 추가 중 오류:', error);
      return { like: null, error };
    }
  }

  // 좋아요 취소
  static async removeLike(userId: string, cafeId: string): Promise<{ error: any }> {
    try {
      console.log('좋아요 취소 - userId:', userId, 'cafeId:', cafeId);
      
      // 사용자 ID를 UUID로 변환
      const uuidUserId = convertUserIdToUUID(userId);
      // 카페 ID를 조회용 UUID로 변환
      const uuidCafeId = convertCafeIdToUUID(cafeId);

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', uuidUserId)
        .eq('cafe_id', uuidCafeId);

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

  // 카페의 좋아요 개수 가져오기
  static async getLikeCount(cafeId: string): Promise<{ count: number; error: any }> {
    try {
      console.log('좋아요 개수 조회 - cafeId:', cafeId);

      // 카페 ID를 조회용 UUID로 변환
      const uuidCafeId = convertCafeIdToUUID(cafeId);

      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('cafe_id', uuidCafeId);

      if (error) {
        console.error('좋아요 개수 조회 오류:', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      console.error('좋아요 개수 조회 중 오류:', error);
      return { count: 0, error };
    }
  }
} 