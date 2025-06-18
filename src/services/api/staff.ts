
import { api } from './client';

export interface Restaurant {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  role: string;
}

export interface StaffMember {
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
  username: string;
  email: string;
  phone_no: string;
  status: number;
}

export interface StaffResponse {
  users: StaffMember[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface UserRole {
  id: number;
  role: string;
}

export interface UserRolesResponse {
  user_roles: UserRole[];
  total: number;
}

export interface StaffFilters {
  page: number;
  perPage: number;
  status?: number;
  search?: string;
  roleId?: string;
  email?: string;
  phone?: string;
  restaurantId?: string;
}

export interface CreateStaffPayload {
  email: string;
  name: string;
  password: string | null;
  phone_no: string;
  restaurant_id: number;
  role_id: number;
  status: number;
}

export interface UpdateStaffPayload {
  name: string;
  email: string;
  phone_no: string;
  status: number;
  role_id: number;
  password?: string;
  restaurant_id: number;
}

export const staffApi = {
  getStaffMembers: async (filters: StaffFilters): Promise<StaffResponse> => {
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        per_page: filters.perPage.toString(),
      });

      if (filters.status !== undefined) {
        params.append('status', filters.status.toString());
      }

      // Use 'name' parameter for search (name search)
      if (filters.search) params.append('name', filters.search);
      
      // Use 'email' parameter for email search
      if (filters.email) params.append('email', filters.email);
      
      // Use 'phone_no' parameter for phone search
      if (filters.phone) params.append('phone_no', filters.phone);
      
      // Use 'role' parameter for role filter (not role_id)
      if (filters.roleId && filters.roleId !== 'all') {
        params.append('role', filters.roleId);
      }

      // Use 'restaurant_id' parameter for location filter
      if (filters.restaurantId && filters.restaurantId !== 'all') {
        params.append('restaurant_id', filters.restaurantId);
      }

      const response = await api.get<StaffResponse>('/users-without-customers', { params });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Legacy method for backward compatibility
  getStaffMembersLegacy: async (page: number, perPage: number, status?: number, search?: string, roleId?: string): Promise<StaffResponse> => {
    return staffApi.getStaffMembers({
      page,
      perPage,
      status,
      search,
      roleId
    });
  },

  getUserRoles: async (): Promise<UserRolesResponse> => {
    try {
      const response = await api.get<UserRolesResponse>('/user-roles', { params: { with_pre_defines: 1 } });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  createStaffMember: async (data: CreateStaffPayload) => {
    try {
      // Use the correct endpoint '/user' and send the payload with the expected structure
      const response = await api.post<StaffMember>('/user', {
        email: data.email,
        name: data.name,
        password: data.password,
        phone_no: data.phone_no,
        restaurant_id: data.restaurant_id,
        role_id: data.role_id,
        status: data.status
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  updateStaffMember: async (id: string, data: UpdateStaffPayload) => {
    try {
      // Use PATCH method with the correct endpoint and payload structure
      const response = await api.patch<StaffMember>(`/user/${id}`, {
        name: data.name,
        email: data.email,
        phone_no: data.phone_no,
        status: data.status,
        role_id: data.role_id,
        restaurant_id: data.restaurant_id,
        ...(data.password && { password: data.password })
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  getStaffMember: async (id: string) => {
    try {
      const response = await api.get<StaffMember>(`/users/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  deleteStaffMember: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },
};

