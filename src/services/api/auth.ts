import { api } from './client';

export interface AuthResponse {
  token: string;
  session_token: string;
  user: {
    id: string;
    employer_id: number | null;
    role_id: number;
    name: string;
    phone_no: string;
    email: string;
    email_verified_at: string | null;
    remember_token: string | null;
    created_by: string;
    created_at: string;
    updated_by: string;
    updated_at: string;
    status: number;
    username: string;
    dob: string | null;
    gender: string;
    note: string | null;
    postcode: string | null;
    profile_pic_id: number | null;
    restaurant_id: number;
    employee_outlet_id: number;
    referral_code: string | null;
    reward_points: number;
    stripe_customer_id: string | null;
    country_code: string | null;
    roles: {
      id: number;
      role: string;
      restaurant_id: number | null;
      status: number;
    };
    profile_pic: string | null;
  };
}

export interface LoginRecord {
  id: string;
  name: string;
  location: string;
  logged_in_time: string;
  logged_out_time: string | null;
  login_hours: string;
}

export interface LoginReportResponse {
  data: LoginRecord[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const authApi = {
  // Updated login method to handle both direct API response and axios wrapper
  login: async (username: string, password: string, company_code: number) => {
    const response = await api.post<AuthResponse>('/v2/users/admin/login', { 
      username,
      password,
      company_code
    });
    
    // Handle both direct data and axios wrapper
    if ('data' in response) {
      return response.data;
    }
    return response;
  },
  
  // Updated logout method to use the new endpoint and payload format
  logout: () => {
    const sessionToken = localStorage.getItem('token') || '';
    const timestamp = new Date().toISOString();
    
    return api.post('/v2/users/logout', {
      timestamp,
      session_token: sessionToken,
      remove_all_sessions: 0
    });
  },
  
  // Get login report data
  getLoginReport: (params?: { 
    location_id?: number; 
    user_id?: number; 
    date?: string;
    period?: string;
    page?: number;
    per_page?: number;
  }) => 
    api.get<LoginReportResponse>('/v2/reports/login', { params }),
  
  // Check if user is authenticated
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('Admin');
    return !!token && !!adminData;
  },
  
  // Get current user data
  getCurrentUser: () => {
    try {
      const adminData = localStorage.getItem('Admin');
      if (adminData) {
        return JSON.parse(adminData).user;
      }
      return null;
    } catch (error) {
      
      return null;
    }
  },
  
  // Get auth token from local storage
  getToken: () => localStorage.getItem('token'),
  
  // Add password update endpoint
  setPassword: (currentPassword: string, newPassword: string) => {
    return api.post('/user-set-password', {
      currentPassword,
      newPassword
    });
  },
  
  // Add profile update endpoint
  updateProfile: (id: string, data: { name: string; phone_no: string; gender: string }) => {
    return api.patch(`/user/${id}`, data);
  },
  
  // Fetch the current user's info
  getMe: () => {
    return api.get('/me');
  },
};
