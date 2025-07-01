export interface Cafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  images: string[];
  logo?: string;
  features: {
    seats: number;
    deskHeight: 'high' | 'low' | 'mixed';
    outlets: 'many' | 'few' | 'limited';
    wifi: 'excellent' | 'good' | 'average';
    atmosphere: string;
    timeLimit: string;
    recommended: boolean;
  };
  hours: {
    open: string;
    close: string;
    isOpen: boolean;
  };
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
}

export interface NewReview {
  rating: number;
  comment: string;
  purpose: string;
  features: {
    quietness: number;
    comfort: number;
    wifi: number;
    outlets: number;
  };
}
