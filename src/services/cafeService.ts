
import { Cafe, Review, NewReview } from '../types/cafe';

// Mock data - in a real app, this would come from your database
const mockCafes: Cafe[] = [
  {
    id: '1',
    name: '스터디카페 모모',
    address: '강남구 테헤란로 123',
    distance: 0.2,
    rating: 4.5,
    reviewCount: 127,
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
    ],
    features: {
      seats: 45,
      deskHeight: 'mixed',
      outlets: 'many',
      wifi: 'excellent',
      atmosphere: '조용한 공부 분위기',
      timeLimit: '시간제한 없음',
      recommended: true
    },
    hours: {
      open: '07:00',
      close: '23:00',
      isOpen: true
    },
    priceRange: '음료 4,000-7,000원',
    tags: ['공부하기좋은', '콘센트많음', '와이파이빠름', '조용함'],
    reviews: [
      {
        id: '1',
        userId: '1',
        userName: '김공부',
        rating: 5,
        comment: '정말 조용하고 집중하기 좋아요. 콘센트도 충분하고 와이파이도 빨라요!',
        date: '2024-06-15',
        helpful: 23
      }
    ]
  },
  {
    id: '2',
    name: '블루보틀 강남점',
    address: '강남구 논현로 456',
    distance: 0.4,
    rating: 4.2,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
      'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800'
    ],
    features: {
      seats: 25,
      deskHeight: 'high',
      outlets: 'few',
      wifi: 'good',
      atmosphere: '세련된 분위기',
      timeLimit: '2시간',
      recommended: true
    },
    hours: {
      open: '08:00',
      close: '22:00',
      isOpen: true
    },
    priceRange: '음료 5,000-9,000원',
    tags: ['분위기좋음', '커피맛있음', '데이트', '인스타그램'],
    reviews: [
      {
        id: '2',
        userId: '2',
        userName: '커피러버',
        rating: 4,
        comment: '커피 맛은 정말 좋은데 좌석이 좀 부족해요. 분위기는 최고!',
        date: '2024-06-14',
        helpful: 15
      }
    ]
  },
  {
    id: '3',
    name: '토즈 강남센터',
    address: '강남구 강남대로 789',
    distance: 0.6,
    rating: 4.0,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800'
    ],
    features: {
      seats: 80,
      deskHeight: 'low',
      outlets: 'many',
      wifi: 'excellent',
      atmosphere: '업무/스터디 전용',
      timeLimit: '시간제한 없음',
      recommended: false
    },
    hours: {
      open: '06:00',
      close: '24:00',
      isOpen: true
    },
    priceRange: '시간당 2,000원',
    tags: ['넓은공간', '콘센트많음', '24시간', '개인석'],
    reviews: [
      {
        id: '3',
        userId: '3',
        userName: '야근족',
        rating: 4,
        comment: '넓고 콘센트도 많아서 좋은데, 좀 시끄러울 때가 있어요.',
        date: '2024-06-13',
        helpful: 8
      }
    ]
  }
];

export const getCafesNearby = async (): Promise<Cafe[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockCafes;
};

export const getCafeById = async (id: string): Promise<Cafe> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const cafe = mockCafes.find(c => c.id === id);
  if (!cafe) {
    throw new Error('Cafe not found');
  }
  return cafe;
};

export const submitReview = async (cafeId: string, review: NewReview): Promise<Review> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newReview: Review = {
    id: Date.now().toString(),
    userId: 'current_user',
    userName: '사용자',
    rating: review.rating,
    comment: review.comment,
    date: new Date().toISOString().split('T')[0],
    helpful: 0
  };

  // In a real app, this would save to the database
  console.log('리뷰 저장됨:', { cafeId, review: newReview });
  
  return newReview;
};
