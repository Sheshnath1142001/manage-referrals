
import { api } from './client';

export interface AdvanceCashItem {
  id: string;
  amount: number;
  date: string;
  status: string;
  notes?: string;
}

export interface AdvanceCashResponse {
  data: AdvanceCashItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const advanceCashApi = {
  getAdvanceCash: async (params?: { 
    page?: number;
    per_page?: number;
  }): Promise<AdvanceCashResponse> => {
    const response = await api.get('/advance-cashes', { params });
    return response.data; // Extract data from axios response
  }
};
