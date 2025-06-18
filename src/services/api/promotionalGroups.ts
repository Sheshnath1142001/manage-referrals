

import { api } from './client';

export interface PromotionalGroup {
  id: number;
  type: string;
  status?: boolean;
}

export interface PromotionalGroupsResponse {
  success: boolean;
  data: PromotionalGroup[];
}

export const promotionalGroupsApi = {
  getPromotionalGroups: async (): Promise<PromotionalGroup[]> => {
    try {
      const response = await api.get<PromotionalGroupsResponse>('/customer-display/group-types');
      return response
    } catch (error) {
      throw error;
    }
  },

  createPromotionalGroup: async (data: { name: string }): Promise<PromotionalGroup> => {
    try {
      const response = await api.post<{ data: PromotionalGroup }>('/customer-display/group-types', data);
      
      // Handle both direct data and axios wrapper
      if ('data' in response && response.data?.data) {
        return response.data.data;
      }
      return response.data as PromotionalGroup;
    } catch (error) {
      throw error;
    }
  },

  updatePromotionalGroup: async (id: number, data: { name: string }): Promise<PromotionalGroup> => {
    try {
      
      const response = await api.patch<{ data: PromotionalGroup }>(`/customer-display/group-types/${id}`, data);
      
      // Handle both direct data and axios wrapper
      if ('data' in response && response.data?.data) {
        return response.data.data;
      }
      return response.data as PromotionalGroup;
    } catch (error) {
      
      throw error;
    }
  },

  deletePromotionalGroup: async (id: number): Promise<void> => {
    try {
      
      await api.delete(`/customer-display/group-types/${id}`);
    } catch (error) {
      
      throw error;
    }
  }
};

