import { api } from './client';

export interface PostcodeGeo {
  id: number;
  postcode: string;
  suburb: string;
  state: string;
  latitude: string;
  longitude: string;
}

export interface PostcodesGeoResponse {
  success: boolean;
  data: PostcodeGeo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const postcodesGeoApi = {
  search: async (search: string, limit: number = 999) => {
    try {
      const response = await api.get<PostcodesGeoResponse>('/postcodes-geo', {
        params: { search, limit }
      });
      
      // The API client should already unwrap the axios response,
      // so response should directly be the PostcodesGeoResponse
      return response;
    } catch (error) {
      
      throw error;
    }
  }
}; 