import { api } from './client';

export interface CustomerGroup {
  id: number;
  name: string;
  description?: string;
  status: number;
  restaurant_id: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer_groups_users?: Array<{
    user_id: string;
    users?: {
      id: string;
      name?: string;
      email?: string;
      phone_no?: string;
    };
  }>;
  customers_count?: number;
  _count?: {
    customer_groups_users: number;
  };
  user_ids?: string[];
}

export interface Customer {
  id: string;
  name: string;
  role_id: number;
  roles: {
    id: number;
    role: string;
  };
  username: string;
  email: string;
  phone_no: string;
  country_code: string | null;
  status: number;
  customer_groups: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

export interface CustomerGroupsResponse {
  success: boolean;
  data: {
    data: CustomerGroup[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    }
  };
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
}

export const customerGroupsApi = {
  getCustomerGroups: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
    restaurant_id?: number
  ): Promise<CustomerGroupsResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status !== undefined && { status: status.toString() }),
        ...(restaurant_id && { restaurant_id: restaurant_id.toString() })
      });

      
      
      const response = await api.get<CustomerGroupsResponse>(`/v2/customer-groups?${params}`);
      
      
      // The API client interceptor returns response.data directly, so response is already the data
      return response;
    } catch (error) {
      
      throw error;
    }
  },

  getCustomers: async (
    page: number = 1,
    per_page: number = 999999,
    restaurant_id: number = 3,
    status: number = 1,
    search?: string
  ): Promise<CustomersResponse> => {
    try {
      const params = {
        page,
        per_page,
        restaurant_id,
        status,
        ...(search && { name: search })
      };
      
      
      
      const response = await api.get<CustomersResponse>('/customers', { params });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  createCustomerGroup: async (data: {
    name: string;
    description: string;
    status: number;
    user_ids: string[];
    restaurant_id?: number;
  }): Promise<CustomerGroup> => {
    try {
      
      
      const response = await api.post<{ data: CustomerGroup }>('/v2/customer-groups', data);
      return response.data.data;
    } catch (error) {
      
      throw error;
    }
  },

  updateCustomerGroup: async (
    id: number,
    data: {
      name: string;
      description: string;
      status: number;
      user_ids: string[];
    }
  ): Promise<CustomerGroup> => {
    try {
      
      
      const response = await api.put<{ data: CustomerGroup }>(`/v2/customer-groups/${id}`, data);
      return response.data.data;
    } catch (error) {
      
      throw error;
    }
  },

  deleteCustomerGroup: async (id: number): Promise<void> => {
    try {
      
      
      await api.delete(`/v2/customer-groups/${id}`);
    } catch (error) {
      
      throw error;
    }
  }
};
