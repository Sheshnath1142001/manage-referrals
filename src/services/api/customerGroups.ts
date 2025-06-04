import { api } from './client';

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  status: number;
  created_at: string;
  updated_at: string;
  customer_groups_users?: Array<{ user_id: string }>;
  customers_count?: number;
  _count?: {
    customer_groups_users: number;
  };
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

      console.log('Fetching customer groups with params:', { page, limit, search, status, restaurant_id });
      
      const response = await api.get<CustomerGroupsResponse>(`/v2/customer-groups?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer groups:', error);
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
      
      console.log('Fetching customers with params:', params);
      
      const response = await api.get<CustomersResponse>('/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
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
      console.log('Creating customer group with data:', data);
      
      const response = await api.post<{ data: CustomerGroup }>('/v2/customer-groups', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating customer group:', error);
      throw error;
    }
  },

  updateCustomerGroup: async (
    id: string,
    data: {
      name: string;
      description: string;
      status: number;
      user_ids: string[];
    }
  ): Promise<CustomerGroup> => {
    try {
      console.log(`Updating customer group ${id} with data:`, data);
      
      const response = await api.put<{ data: CustomerGroup }>(`/v2/customer-groups/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating customer group ${id}:`, error);
      throw error;
    }
  },

  deleteCustomerGroup: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting customer group ${id}`);
      
      await api.delete(`/v2/customer-groups/${id}`);
    } catch (error) {
      console.error(`Error deleting customer group ${id}:`, error);
      throw error;
    }
  }
};
