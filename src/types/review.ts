export interface Review {
  user_id: string;
  cafe_id: string;
  cafe_name: string;
  comment: string;
  rating: number;
  date: string;
}

export interface LikedCafe {
  id: string;
  name: string;
  address: string;
  rating?: number;
  liked_at: string;
} 