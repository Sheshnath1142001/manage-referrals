import { api } from './client';

export interface TopPerformerItem {
  id: string;
  name: string;
  total_sales: number;
  orders_count: number;
  average_order_value: number;
}

export interface TopPerformersResponse {
  data: TopPerformerItem[];
  columns: string[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const topPerformersApi = {
  getTopPerformers: async (params?: { 
    page?: number;
    per_page?: number;
    date?: string;
    period?: string;
  }): Promise<TopPerformersResponse> => {
    const response = await api.get<TopPerformersResponse>('/top-performers', { params });
    const data = response.data;
    
    return {
      ...data,
      columns: data.columns || ['Name', 'Total Sales', 'Orders Count', 'Average Order Value']
    };
  }
};
