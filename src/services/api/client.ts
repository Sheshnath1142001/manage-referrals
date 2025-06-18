import axios from 'axios';
import { toast } from "@/hooks/use-toast";

// Define common API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  categories?: T[];
}

// Get API base URL from environment with fallback
const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.au/api';


// Function to get the user's current timezone
const getUserTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return timezone;
  } catch (error) {
    
    return 'UTC';
  }
};

// Create axios instance for API calls
export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Accept': 'application/json',
    'X-Timezone': getUserTimezone()
    // ✅ REMOVED: Don't set Content-Type globally - let each request decide
  }
});




// Add a response interceptor to handle common response processing
api.interceptors.response.use(
  (response) => {
    
    
    
    // Return the actual response data directly
    return response.data;
  },
  (error) => {
    
    
    let errorMessage = 'Something went wrong';
    
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      }
      
      if (error.response.status === 401) {
        
        localStorage.removeItem('Admin');
        localStorage.removeItem('token');
        errorMessage = 'Your session has expired. Please log in again.';
        
        const path = window.location.pathname;
        if (path !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your internet connection.';
    } 
    
    if (!error.config?.skipErrorToast) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    
    
    const adminData = localStorage.getItem('Admin');
    
    
    config.headers['X-Timezone'] = getUserTimezone();
    
    // ✅ FIXED: Only set Content-Type for non-FormData requests
    config.headers['Accept'] = 'application/json';
    
    // Check if this is a FormData request
    if (!(config.data instanceof FormData)) {
      // Only set Content-Type to JSON for non-FormData requests
      config.headers['Content-Type'] = 'application/json';
      
    } else {
      // For FormData, let the browser set Content-Type with boundary
      
      // Don't set Content-Type at all - browser will set it automatically
      delete config.headers['Content-Type'];
    }
    
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin && admin.token) {
          
          config.headers.Authorization = `Bearer ${admin.token}`;
        } else {
          // If no token in admin data, try to get it directly
          const token = localStorage.getItem('token');
          if (token) {
            
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            
          }
        }
      } catch (error) {
        
        // Try to get token directly if parsing fails
        const token = localStorage.getItem('token');
        if (token) {
          
          config.headers.Authorization = `Bearer ${token}`;
        }
        localStorage.removeItem('Admin');
      }
    } else {
      // If no admin data, try to get token directly
      const token = localStorage.getItem('token');
      if (token) {
        
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);