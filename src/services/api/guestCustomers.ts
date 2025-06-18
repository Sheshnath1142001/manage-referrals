import { api, PaginatedResponse } from './client';

export interface GuestCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: 'Active' | 'Inactive' | string | number;
}

export interface GuestCustomerResponse extends PaginatedResponse<GuestCustomer> {
  data: GuestCustomer[];
  customers?: GuestCustomer[];
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

export const guestCustomersApi = {
  getGuestCustomers: async (params?: {
    page?: number;
    per_page?: number;
    status?: string | number;
    email?: string;
    phone?: string;
  }) => {
    try {
      // Use the correct endpoint: /guests
      const response = await api.get<any>('/guests', { 
        params: removeEmptyParams(params || {})
      });
      
      let customers: GuestCustomer[] = [];
      let total = 0;
      let page = params?.page || 1;
      let perPage = params?.per_page || 10;
      
      const responseData = response.data;
      
      // Handle different API response formats
      if (response && typeof response === 'object') {
        const responseData = response.data;
        
        // If response has customers array directly
        if (responseData.customers && Array.isArray(responseData.customers)) {
          customers = responseData.customers;
          total = responseData.total || customers.length;
          page = responseData.page || page;
          perPage = responseData.per_page || perPage;
        } 
        // If response has data property with customers array
        else if (responseData.data && Array.isArray(responseData.data)) {
          customers = responseData.data;
          total = responseData.total || customers.length;
          page = responseData.page || page;
          perPage = responseData.per_page || perPage;
        }
        // Handle nested data structure
        else if (responseData.data && responseData.data.data && Array.isArray(responseData.data.data)) {
          customers = responseData.data.data;
          total = responseData.data.total || customers.length;
          page = responseData.data.page || page;
          perPage = responseData.data.per_page || perPage;
        }
      }
      
      return {
        data: customers,
        customers: customers, // For backward compatibility
        total: total,
        page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage)
      } as GuestCustomerResponse;
    } catch (error) {
      
      return { 
        data: [], 
        customers: [],
        total: 0, 
        page: params?.page || 1, 
        per_page: params?.per_page || 10, 
        total_pages: 0 
      } as GuestCustomerResponse;
    }
  },
  
  getGuestCustomer: (id: string) => api.get<GuestCustomer>(`/guests/${id}`),
  
  createGuestCustomer: (data: Partial<Omit<GuestCustomer, 'id'>>) => 
    api.post<GuestCustomer>('/guests', data),
  
  updateGuestCustomer: (id: string, data: Partial<Omit<GuestCustomer, 'id'>>) => 
    api.put<GuestCustomer>(`/guests/${id}`, data),
  
  deleteGuestCustomer: (id: string) => api.delete(`/guests/${id}`)
};
