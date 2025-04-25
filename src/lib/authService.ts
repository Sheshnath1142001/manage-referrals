import api from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  isEmailVerified?: boolean;
  profileImage?: string;
  phoneNumber?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'customer' | 'owner';
  phoneNumber?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Get current user from local storage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Register a new user
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', {
    ...userData,
    role: userData.role || 'customer', // Default to customer role if not specified
  });

  // Store tokens and user data
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);

  // Store tokens and user data
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');

  // Update stored user data
  localStorage.setItem('user', JSON.stringify(response.data));

  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/users/profile', userData);

  // Update stored user data
  const currentUser = getCurrentUser();
  if (currentUser) {
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
  }

  return response.data;
};

// Forgot password
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

// Reset password
export const resetPassword = async (token: string, password: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, password });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

// Check if user has specific role
export const hasRole = (role: 'customer' | 'owner' | 'admin'): boolean => {
  const user = getCurrentUser();
  return user ? user.role === role : false;
};

// Check if user is an owner (for protected routes)
export const isOwner = (): boolean => {
  return hasRole('owner');
};

// Refresh token
export const refreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
      refreshToken,
    });

    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    return null;
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Redirect to home page
  window.location.href = '/';
};