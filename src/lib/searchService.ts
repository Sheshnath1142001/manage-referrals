import api from './api';
import { FoodTruck } from './foodTruckService';

export interface SearchResponse {
  items: FoodTruck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  cuisineType?: string;
  tags?: string[];
  lat?: number;
  lng?: number;
  distance?: number;
  sortBy?: 'rating' | 'distance' | 'popularity';
}

// Search food trucks
export const searchFoodTrucks = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await api.get<SearchResponse>('/search/food-trucks', { params });
  return response.data;
};

// Get search suggestions as user types
export const getSearchSuggestions = async (query: string, limit = 5): Promise<string[]> => {
  const response = await api.get<string[]>('/search/suggestions', {
    params: { query, limit }
  });
  return response.data;
};

// Get cuisine types for filtering
export const getCuisineTypes = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/search/cuisines');
  return response.data;
};