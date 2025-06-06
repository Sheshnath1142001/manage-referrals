import { api } from './client';

export interface UserRole {
  id: number;
  role: string;
}

export interface UserRolesResponse {
  user_roles: UserRole[];
  total: number;
}

// Get all user roles
export const getUserRoles = async (params?: {
  page?: number;
  per_page?: number;
  status?: number;
  with_pre_defines?: number;
}) => {
  try {
    const response = await api.get('/user-roles', { params });
    return response;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return { user_roles: [], total: 0 };
  }
};

// Get a specific user role
export const getUserRole = (id: number) => {
  return api.get(`/user-roles/${id}`);
};

// Create a new user role
export const createUserRole = (data: Partial<UserRole>) => {
  return api.post('/user-roles', data);
};

// Update a user role
export const updateUserRole = (id: number, data: Partial<UserRole>) => {
  return api.put(`/user-roles/${id}`, data);
};

// Delete a user role
export const deleteUserRole = (id: number) => {
  return api.delete(`/user-roles/${id}`);
};

export const userRolesApi = {
  getUserRoles,
  getUserRole,
  createUserRole,
  updateUserRole,
  deleteUserRole
};
