export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role?: string;
  restaurant_id: null | number;
  company_code?: number;
}

export interface AuthResponse {
  token: string;
  session_token?: string;
  user: User;
  success?: boolean;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
