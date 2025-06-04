
import { api, PaginatedResponse } from './client';

export interface Customer {
  id: string;
  name: string;
  role_id: number;
  roles: {
    id: number;
    role: string;
    restaurant_id?: number | null; // Added restaurant_id as optional property
    status?: number;
  };
  username: string;
  email: string;
  phone_no: string;
  country_code: string | null;
  status: number;
  customer_groups: any[];
}

export interface CustomerAddress {
  id: string;
  unit_number: string;
  street_name: string;
  postcode: string;
  latitude: string;
  longitude: string;
  phone: string | null;
  alternate_phone: string | null;
  is_default: number;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  city: string;
  country: string;
  province: string;
  module_id: number;
  module_type: number;
}

export interface CustomerResponse {
  customers: Customer[];
  total: number;
}

// Helper function to remove empty params
const removeEmptyParams = (params: Record<string, any>) => {
  const cleanParams: Record<string, any> = {};
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  }
  
  return cleanParams;
};

export const customersApi = {
  getCustomers: async (params?: {
    page?: number;
    per_page?: number;
    status?: string | number;
    email?: string;
    phone?: string;
  }): Promise<CustomerResponse> => {
    try {
      const response = await api.get<CustomerResponse>('/customers', { 
        params: removeEmptyParams(params || {})
      });
      
      // Handle both direct data and axios wrapper
      if ('data' in response) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { customers: [], total: 0 };
    }
  },
  
  getCustomer: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    // Handle both direct data and axios wrapper
    if ('data' in response) {
      return response.data;
    }
    return response as unknown as Customer;
  },
  
  getCustomerAddress: async (moduleId: string): Promise<CustomerAddress[]> => {
    const response = await api.get<CustomerAddress[]>(`/address?module_type=6&module_id=${moduleId}`);
    // Handle both direct data and axios wrapper
    if ('data' in response) {
      return response.data;
    }
    return response as unknown as CustomerAddress[];
  },
  
  createCustomer: (data: Partial<Omit<Customer, 'id'>>) => 
    api.post<Customer>('/customers', data),
  
  updateCustomer: (id: string, data: Partial<Omit<Customer, 'id'>>) => 
    api.put<Customer>(`/customers/${id}`, data),
  
  updateCustomerAddress: (id: string, data: Partial<CustomerAddress>) =>
    api.put<CustomerAddress>(`/address/${id}`, data),
  
  createCustomerAddress: (data: Partial<CustomerAddress>) =>
    api.post<CustomerAddress>('/address', data),
  
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`)
};
