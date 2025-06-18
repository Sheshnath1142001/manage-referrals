import { api } from './client';

export interface Guest {
  id: string;
  name: string;
  role_id: number;
  roles: {
    id: number;
    role: string;
  };
  employee_outlet_id: number;
  restaurants_users_employee_outlet_idTorestaurants: {
    id: number;
    name: string;
  };
  restaurant_id: number;
  restaurants_users_restaurant_idTorestaurants: {
    id: number;
    name: string;
  };
  username: string | null;
  email: string;
  phone_no: string;
  status: number;
}

export interface GuestsResponse {
  guests: Guest[];
  total: number;
}

export const guestsApi = {
  getGuests: async (page: number, perPage: number, status: number = 1, search?: string, email?: string, phone_no?: string): Promise<GuestsResponse> => {
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        status: status.toString(),
      });

      if (search) params.append('search', search);
      if (email) params.append('email', email);
      if (phone_no) params.append('phone_no', phone_no);

      const response = await api.get<GuestsResponse>('/guests', { params });
      return response;
    } catch (error: any) {
      console.error('❌ getGuests Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  createGuest: async (data: Partial<Guest>) => {
    
    try {
      const response = await api.post<Guest>('/guests', data);
      return response;
    } catch (error: any) {
      console.error('❌ createGuest Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  updateGuest: async (id: string, data: Partial<Guest>) => {
    
    try {
      const response = await api.put<Guest>(`/guests/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('❌ updateGuest Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  deleteGuest: async (id: string) => {
    
    try {
      const response = await api.delete(`/guests/${id}`);
      return response;
    } catch (error: any) {
      console.error('❌ deleteGuest Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  getGuest: async (id: string): Promise<Guest> => {
    try {
      const response = await api.get<Guest>(`/guests/${id}`);
      return response;
    } catch (error: any) {
      console.error('❌ getGuest Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }
}; 