
export interface Database {
  public: {
    Tables: {
      cafes: {
        Row: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          rating: number
          review_count: number
          images: string[]
          logo: string | null
          seats: number
          desk_height: 'high' | 'low' | 'mixed'
          outlets: 'many' | 'few' | 'limited'
          wifi: 'excellent' | 'good' | 'average'
          atmosphere: string
          time_limit: string
          recommended: boolean
          open_time: string
          close_time: string
          is_open: boolean
          price_range: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude: number
          longitude: number
          rating?: number
          review_count?: number
          images: string[]
          logo?: string | null
          seats: number
          desk_height: 'high' | 'low' | 'mixed'
          outlets: 'many' | 'few' | 'limited'
          wifi: 'excellent' | 'good' | 'average'
          atmosphere: string
          time_limit: string
          recommended?: boolean
          open_time: string
          close_time: string
          is_open?: boolean
          price_range: string
          tags: string[]
        }
        Update: {
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          rating?: number
          review_count?: number
          images?: string[]
          logo?: string | null
          seats?: number
          desk_height?: 'high' | 'low' | 'mixed'
          outlets?: 'many' | 'few' | 'limited'
          wifi?: 'excellent' | 'good' | 'average'
          atmosphere?: string
          time_limit?: string
          recommended?: boolean
          open_time?: string
          close_time?: string
          is_open?: boolean
          price_range?: string
          tags?: string[]
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          cafe_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          purpose: string
          quietness: '좋음' | '보통' | '아쉬움'
          comfort: '편함' | '보통' | '불편함'
          wifi: '있음' | '없음'
          outlets: '있음' | '없음'
          helpful: number
          created_at: string
        }
        Insert: {
          id?: string
          cafe_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          purpose: string
          quietness: '좋음' | '보통' | '아쉬움'
          comfort: '편함' | '보통' | '불편함'
          wifi: '있음' | '없음'
          outlets: '있음' | '없음'
          helpful?: number
        }
        Update: {
          rating?: number
          comment?: string
          purpose?: string
          quietness?: '좋음' | '보통' | '아쉬움'
          comfort?: '편함' | '보통' | '불편함'
          wifi?: '있음' | '없음'
          outlets?: '있음' | '없음'
          helpful?: number
        }
      }
    }
  }
}
