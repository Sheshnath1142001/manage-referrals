// Define the base FoodTruck interface
export interface FoodTruck {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  phone: string;
  location: Location;
  image?: string;
  logo?: string;
  bannerImage?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  operatingHours?: {
    monday?: { open: string; close: string }[];
    tuesday?: { open: string; close: string }[];
    wednesday?: { open: string; close: string }[];
    thursday?: { open: string; close: string }[];
    friday?: { open: string; close: string }[];
    saturday?: { open: string; close: string }[];
    sunday?: { open: string; close: string }[];
  };
  status: 'active' | 'inactive' | 'pending';
  isPremium: boolean;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  imageUrl?: string;  // Added for backward compatibility
  averageRating?: number;
  totalRatings?: number;
  reviewCount?: number;
  tags?: Tag[] | string[];
  deliveryEnabled?: boolean;
  isOpen?: boolean;
  locations?: Location[];
  reviews?: Review[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
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
  isAvailable: boolean;
  foodTruckId: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isPopular?: boolean;
  dietaryRestrictions?: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
  userId?: string;
  foodTruckId: string;
  images?: string[];
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  foodTruckCount?: number;
}

export interface MenuItemListResponse {
  items: MenuItem[];
  total: number;
  page?: number;
  limit?: number;
}

export interface LocationListResponse {
  items: Location[];
  total: number;
  page?: number;
  limit?: number;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface OperatingHours {
  monday?: DayHours[] | DayHours;
  tuesday?: DayHours[] | DayHours;
  wednesday?: DayHours[] | DayHours;
  thursday?: DayHours[] | DayHours;
  friday?: DayHours[] | DayHours;
  saturday?: DayHours[] | DayHours;
  sunday?: DayHours[] | DayHours;
  [key: string]: DayHours[] | DayHours | undefined;
}

export interface SearchParams {
  query?: string;
  cuisineType?: string;
  tags?: string[];
  lat?: number;
  lng?: number;
  distance?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
