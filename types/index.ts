export interface FoodTruck {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  description: string;
  menu: MenuItem[];
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  openingHours: {
    day: string;
    hours: string;
  }[];
  rating: number;
  reviews: Review[];
  owner: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  popular?: boolean;
  dietary?: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
  reply?: {
    text: string;
    date: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  savedTrucks: string[];
  reviews: string[];
  role: 'customer' | 'owner';
}

export interface OwnerAnalytics {
  profileViews: number;
  averageRating: number;
  reviewsCount: number;
  popularItems: {
    itemId: string;
    count: number;
  }[];
  viewsByDay: {
    day: string;
    count: number;
  }[];
}

export interface Subscription {
  id: string;
  name: 'Basic' | 'Premium';
  price: number;
  features: string[];
  current: boolean;
}