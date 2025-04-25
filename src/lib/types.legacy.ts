
export interface FoodTruck {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  operatingHours: OperatingHours;
  menu: MenuItem[];
  reviews: Review[];
  rating: number;
  tags?: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  [key: string]: DayHours | undefined;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isPopular?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  date?: string;
  images?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id?: string;
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  name?: string;
}

export interface MenuItemListResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
}

export interface LocationListResponse {
  items: Location[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
