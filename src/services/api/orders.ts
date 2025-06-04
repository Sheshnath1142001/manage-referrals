
import { api, PaginatedResponse } from './client';

export interface Order {
  id: string | number;
  customer_id: string | number;
  status: string;
  total: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderResponse extends PaginatedResponse<Order> {
  data: Order[];
}

export const ordersApi = {
  getOrders: (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    customer_id?: string | number;
  }) => api.get<OrderResponse>('/orders', { params }),

  getOrder: (id: string | number) => api.get<Order>(`/orders/${id}`),

  updateOrderStatus: (id: string | number, status: string) => 
    api.put<Order>(`/orders/${id}/status`, { status })
};
