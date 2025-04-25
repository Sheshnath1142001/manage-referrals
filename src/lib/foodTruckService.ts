import { dummyData, simulateApiCall } from './dummyData';
import { 
  FoodTruck, 
  Location, 
  MenuItem, 
  Review, 
  Tag, 
  FoodTruckFilter,
  MenuItemListResponse,
  LocationListResponse
} from './types.d';

interface FoodTruckResponse {
  items: FoodTruck[];
  total: number;
  page: number;
  limit: number;
}

interface FoodTruckQueryParams {
  limit?: number;
  page?: number;
  sort?: string;
  isActive?: boolean;
  tags?: string[];
  search?: string;
}

export interface FoodTruckListResponse {
  items: FoodTruck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllFoodTrucks = async (params: any = {}): Promise<{ items: FoodTruck[]; total: number }> => {
  return simulateApiCall({
    items: dummyData.foodTrucks,
    total: dummyData.foodTrucks.length
  });
};

export const getFoodTruckById = async (id: string): Promise<FoodTruck | null> => {
  const truck = dummyData.foodTrucks.find(t => t.id === id);
  return simulateApiCall(truck || null);
};

export const getFoodTruckReviews = async (id: string): Promise<Review[]> => {
  return simulateApiCall([]);
};

export const getFoodTruckMenu = async (id: string): Promise<MenuItem[]> => {
  return simulateApiCall([]);
};

export const getFoodTruckBySlug = async (slug: string): Promise<FoodTruck | null> => {
  const truck = dummyData.foodTrucks.find(t => t.name === slug);
  return simulateApiCall(truck || null);
};

export const createFoodTruck = async (foodTruckData: Partial<FoodTruck>): Promise<FoodTruck> => {
  return simulateApiCall(foodTruckData as FoodTruck);
};

export const updateFoodTruck = async (id: string, foodTruckData: Partial<FoodTruck>): Promise<FoodTruck> => {
  return simulateApiCall(foodTruckData as FoodTruck);
};

export const deleteFoodTruck = async (id: string): Promise<void> => {
  return simulateApiCall(undefined);
};

export const getUserFoodTrucks = async (): Promise<FoodTruck[]> => {
  return simulateApiCall(dummyData.foodTrucks);
};

export const searchFoodTrucks = async (searchTerm: string, filters: Partial<FoodTruckFilter> = {}): Promise<FoodTruckListResponse> => {
  return simulateApiCall({
    items: dummyData.foodTrucks,
    total: dummyData.foodTrucks.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
};

export const uploadFoodTruckLogo = async (id: string, file: File): Promise<{ url: string }> => {
  return simulateApiCall({ url: 'dummy-url' });
};

export const uploadFoodTruckBanner = async (id: string, file: File): Promise<{ url: string }> => {
  return simulateApiCall({ url: 'dummy-url' });
};

export const addGalleryImage = async (id: string, file: File): Promise<{ url: string }> => {
  return simulateApiCall({ url: 'dummy-url' });
};

export const removeGalleryImage = async (id: string, imageUrl: string): Promise<void> => {
  return simulateApiCall(undefined);
};
