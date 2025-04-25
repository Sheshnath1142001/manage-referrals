import api from './api';
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

export const getAllFoodTrucks = async (params: FoodTruckQueryParams = {}): Promise<FoodTruckResponse> => {
  const response = await api.get<FoodTruckResponse>('/food-trucks', { params });
  return response.data;
};

export const getFoodTruckById = async (id: string): Promise<FoodTruck> => {
  const response = await api.get<FoodTruck>(`/food-trucks/${id}`);
  return response.data;
};

export const getFoodTruckReviews = async (id: string): Promise<Review[]> => {
  const response = await api.get<Review[]>(`/food-trucks/${id}/reviews`);
  return response.data;
};

export const getFoodTruckMenu = async (id: string): Promise<MenuItem[]> => {
  const response = await api.get<MenuItem[]>(`/food-trucks/${id}/menu`);
  return response.data;
};

export const getFoodTruckBySlug = async (slug: string): Promise<FoodTruck> => {
  const response = await api.get<FoodTruck>(`/food-trucks/slug/${slug}`);
  return response.data;
};

export const createFoodTruck = async (foodTruckData: Partial<FoodTruck>): Promise<FoodTruck> => {
  const response = await api.post<FoodTruck>('/food-trucks', foodTruckData);
  return response.data;
};

export const updateFoodTruck = async (id: string, foodTruckData: Partial<FoodTruck>): Promise<FoodTruck> => {
  const response = await api.put<FoodTruck>(`/food-trucks/${id}`, foodTruckData);
  return response.data;
};

export const deleteFoodTruck = async (id: string): Promise<void> => {
  await api.delete(`/food-trucks/${id}`);
};

export const getUserFoodTrucks = async (): Promise<FoodTruck[]> => {
  const response = await api.get<FoodTruck[]>('/food-trucks/user/me');
  return response.data;
};

export const searchFoodTrucks = async (searchTerm: string, filters: Partial<FoodTruckFilter> = {}): Promise<FoodTruckListResponse> => {
  const response = await api.get<FoodTruckListResponse>('/food-trucks/search', {
    params: {
      searchTerm,
      ...filters
    }
  });
  return response.data;
};

export const uploadFoodTruckLogo = async (id: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<{ url: string }>(`/food-trucks/${id}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadFoodTruckBanner = async (id: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<{ url: string }>(`/food-trucks/${id}/banner`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const addGalleryImage = async (id: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<{ url: string }>(`/food-trucks/${id}/gallery`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const removeGalleryImage = async (id: string, imageUrl: string): Promise<void> => {
  await api.delete(`/food-trucks/${id}/gallery`, {
    data: { imageUrl }
  });
};
