export interface Cafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  images: string[];
  logo?: string;
  features: {
    seats: '0' | '1~5' | '6~10' | 'many';
    deskHeight: 'high' | 'low' | 'mixed';
    outlets: 'many' | 'few' | 'limited';
    recommended: boolean;
    wifi: 'excellent' | 'good' | 'average'|'unavailable';
    atmosphere: string[];
  };
  hours: {
    open: string;
    close: string;
    isOpen: boolean;
  };
  comments: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  purpose: string;
  features: {
    seats: '0' | '1~5' | '6~10' | 'many';
    deskHeight: 'high' | 'low' | 'mixed';
    outlets: 'many' | 'few' | 'limited';
    wifi: 'excellent' | 'good' | 'average' | 'unavailable';
  };
  atmosphere: string[];
  visitDate: string;
  visitTime: string;
  stayDuration: string;
  priceSatisfaction: number;
  overallSatisfaction: number;
}

export interface NewReview {
  rating: number;
  comment: string;
  purpose: string;
  features: {
    seats: '0' | '1~5' | '6~10' | 'many';
    deskHeight: 'high' | 'low' | 'mixed';
    outlets: 'many' | 'few' | 'limited';
    wifi: 'excellent' | 'good' | 'average' | 'unavailable';
  };
  atmosphere: string[];
  visitDate: string;
  visitTime: string;
  stayDuration: string;
  priceSatisfaction: number;
  overallSatisfaction: number;
}
