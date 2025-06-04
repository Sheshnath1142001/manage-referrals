
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
const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';
console.log('API Base URL:', apiBaseUrl);

// Function to get the user's current timezone
const getUserTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('User timezone detected:', timezone);
    return timezone;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'UTC';
  }
};

// Create axios instance for API calls
export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Timezone': getUserTimezone()
  }
});

console.log('Axios instance created with baseURL:', api.defaults.baseURL);
console.log('Using timezone in API headers:', api.defaults.headers['X-Timezone']);

// Add a response interceptor to handle common response processing
api.interceptors.response.use(
  (response) => {
    console.log('API Success Response:', response.config.url, response.status);
    console.log('Response data structure:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    // Return the actual response data directly
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
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
        console.log('401 Unauthorized - clearing local storage');
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
    console.log('Making API request to:', config.url);
    
    const adminData = localStorage.getItem('Admin');
    console.log('Admin data from localStorage:', adminData ? 'Present' : 'Not present');
    
    config.headers['X-Timezone'] = getUserTimezone();
    
    // Set default headers
    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';
    
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin && admin.token) {
          console.log('Auth token found, adding to request');
          config.headers.Authorization = `Bearer ${admin.token}`;
        } else {
          // If no token in admin data, try to get it directly
          const token = localStorage.getItem('token');
          if (token) {
            console.log('Token found directly in localStorage');
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('No auth token found');
          }
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        // Try to get token directly if parsing fails
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token found directly in localStorage after parse error');
          config.headers.Authorization = `Bearer ${token}`;
        }
        localStorage.removeItem('Admin');
      }
    } else {
      // If no admin data, try to get token directly
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token found directly in localStorage (no admin data)');
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
