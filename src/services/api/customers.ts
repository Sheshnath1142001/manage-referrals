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
    phone_no?: string;
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
  
  createCustomer: async (data: any) => {
    try {
      // Format data for customer creation using /v2/users/admin endpoint
      const createData = {
        name: data.name,
        email: data.email,
        phone_no: data.phone_no,
        country_code: data.country_code?.replace('+', ''), // Remove + from country code
        status: data.status ? 1 : 0,
        role_id: data.role_id || 3, // Default to role_id 3 (Customer)
        customer_group_ids: data.customer_groups?.map((id: string) => parseInt(id)) || [] // Convert to array of numbers
      };
      
      console.log('Creating customer with data:', createData); // Debug log
      
      const response = await api.post('/v2/users/admin', createData);
      
      console.log('Create customer response:', response); // Debug log
      
      // Handle the response structure from the API
      if ('data' in response) {
        return response.data.user || response.data;
      }
      return response.user || response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },
  
  updateCustomer: async (id: string, data: any) => {
    // Use the correct endpoint from curl: /v2/users/admin/{id}
    const updateData = {
      name: data.name,
      email: data.email,
      phone_no: data.phone_no,
      country_code: data.country_code?.replace('+', ''), // Remove + from country code
      status: data.status ? 1 : 0,
      role_id: data.role_id || 3, // Default to role_id 3 (Customer)
      customer_group_ids: data.customer_groups?.map((id: string) => parseInt(id)) || [] // Convert to array of numbers
    };
    
    return api.put(`/v2/users/admin/${id}`, updateData);
  },
  
  updateCustomerAddress: async (id: string, data: Partial<CustomerAddress> & { module_id?: string }) => {
    // Use the correct endpoint from curl: /update-address/{id}
    const updateData = {
      street_name: data.street_name,
      city: data.city,
      province: data.province,
      country: data.country,
      unit_number: data.unit_number,
      latitude: data.latitude || "00",
      longitude: data.longitude || "00", 
      postcode: data.postcode,
      phone: data.phone || null,
      module_type: 6,
      module_id: data.module_id || data.module_id?.toString()
    };
    
    return api.put(`/update-address/${id}`, updateData);
  },
  
  createCustomerAddress: (data: Partial<CustomerAddress>) =>
    api.post<CustomerAddress>('/address', data),
  
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`)
};
