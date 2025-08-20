import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LikeService } from '@/services/like';
import type { LikeStatus } from '@/types/like';

interface LikeButtonProps {
  cafeId: string;
  initialLikeCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onLikeChange?: (isLiked: boolean, count: number) => void;
}

export default function LikeButton({ 
  cafeId, 
  initialLikeCount = 0, 
  size = 'md',
  showCount = true,
  onLikeChange 
}: LikeButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [likeStatus, setLikeStatus] = useState<LikeStatus>({ isLiked: false });
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // 좋아요 상태와 개수 초기화
  useEffect(() => {
    if (isAuthenticated && user) {
      loadLikeStatus();
      loadLikeCount();
    }
  }, [cafeId, user, isAuthenticated]);

  const loadLikeStatus = async () => {
    if (!user) return;
    
    try {
      const { status, error } = await LikeService.getLikeStatus(user.id, cafeId);
      if (!error) {
        setLikeStatus(status);
      }
    } catch (error) {
      console.error('좋아요 상태 로딩 실패:', error);
    }
  };

  const loadLikeCount = async () => {
    try {
      const { count, error } = await LikeService.getLikeCount(cafeId);
      if (!error) {
        setLikeCount(count);
      }
    } catch (error) {
      console.error('좋아요 개수 로딩 실패:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      if (likeStatus.isLiked) {
        // 좋아요 취소
        const { error } = await LikeService.removeLike(user.id, cafeId);
        if (!error) {
          setLikeStatus({ isLiked: false });
          setLikeCount(prev => Math.max(0, prev - 1));
          onLikeChange?.(false, likeCount - 1);
        } else {
          console.error('좋아요 취소 실패:', error);
        }
      } else {
        // 좋아요 추가
        const { like, error } = await LikeService.addLike(user.id, cafeId);
        if (!error && like) {
          setLikeStatus({ isLiked: true, likeId: like.id });
          setLikeCount(prev => prev + 1);
          onLikeChange?.(true, likeCount + 1);
        } else {
          console.error('좋아요 추가 실패:', error);
        }
      }
    } catch (error) {
      console.error('좋아요 토글 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeToggle}
        disabled={isLoading}
        className={`${getButtonSize()} p-0 ${
          likeStatus.isLiked 
            ? 'text-red-500 hover:text-red-700 hover:bg-red-50' 
            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
        }`}
      >
        <Heart 
          className={`${getIconSize()} ${likeStatus.isLiked ? 'fill-current' : ''}`} 
        />
      </Button>
      {showCount && (
        <span className="text-sm text-gray-600 min-w-[1.5rem]">
          {likeCount}
        </span>
      )}
    </div>
  );
} 