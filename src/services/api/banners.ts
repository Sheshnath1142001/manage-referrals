import { api } from './client';

export interface CreateBannerPayload {
  banner_name: string;
  status: number; // 1 | 0
  category_id: number;
  description?: string | null;
}

export interface BannerResponse {
  message: string;
  data: {
    id: number;
    banner_name: string;
    category_id: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    status: number;
    description: string | null;
    restaurant_id: number;
  };
}

export const bannersApi = {
  /**
   * Create a new banner (online promotion).
   */
  createBanner: async (payload: CreateBannerPayload): Promise<BannerResponse> => {
    const response = await api.post('/create-banner', payload);
    return response as BannerResponse;
  },

  /**
   * Fetch banners list.
   * Accepts optional pagination and tenant/location filter params.
   */
  getBanners: async (params?: {
    page?: number | string;
    per_page?: number | string;
    tenant_id?: number | string;
  }): Promise<any> => {
    const response = await api.get('/banners', { params });
    return response;
  },

  /**
   * Update an existing banner.
   */
  updateBanner: async (payload: {
    banner_id: number | string;
    banner_name?: string;
    category_id?: number;
    description?: string | null;
    status?: number;
  }): Promise<BannerResponse | any> => {
    const response = await api.put('/update-banner', payload);
    return response;
  },

  /**
   * Delete a banner by id.
   */
  deleteBanner: async (banner_id: number | string): Promise<any> => {
    const response = await api.delete('/delete-banner', {
      data: { bannerId: banner_id },
    });
    return response;
  },
}; 