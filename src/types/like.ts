export interface Like {
  id: string;
  user_id: string;
  cafe_id: string;
  created_at: string;
}

export interface LikeStatus {
  isLiked: boolean;
  likeId?: string;
} 