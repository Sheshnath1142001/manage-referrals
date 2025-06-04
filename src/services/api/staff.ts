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
}

export interface UserRole {
  id: number;
  role: string;
}

export interface UserRolesResponse {
  user_roles: UserRole[];
  total: number;
}

export const staffApi = {
  getStaffMembers: async (page: number, perPage: number, status?: number, search?: string, roleId?: string): Promise<StaffResponse> => {
    console.log('📞 Calling getStaffMembers with:', { page, perPage, status, search, roleId });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (status !== undefined) {
        params.append('status', status.toString());
      }

      if (search) params.append('name', search);
      if (roleId) params.append('role_id', roleId);

      const response = await api.get<StaffResponse>('/users-without-customers', { params });
      return response;
    } catch (error: any) {
      console.error('❌ getStaffMembers Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  getUserRoles: async (): Promise<UserRolesResponse> => {
    console.log('📞 Calling getUserRoles');
    try {
      const response = await api.get<UserRolesResponse>('/user-roles', { params: { with_pre_defines: 1 } });
      return response;
    } catch (error: any) {
      console.error('❌ getUserRoles Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  createStaffMember: async (data: Partial<StaffMember>) => {
    console.log('📞 Calling createStaffMember with:', data);
    try {
      const response = await api.post<StaffMember>('/users', data);
      return response;
    } catch (error: any) {
      console.error('❌ createStaffMember Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  updateStaffMember: async (id: string, data: Partial<StaffMember>) => {
    console.log('📞 Calling updateStaffMember with:', { id, data });
    try {
      const response = await api.put<StaffMember>(`/users/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('❌ updateStaffMember Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  deleteStaffMember: async (id: string) => {
    console.log('📞 Calling deleteStaffMember with:', { id });
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error: any) {
      console.error('❌ deleteStaffMember Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },
  
  getStaffMember: async (id: string): Promise<StaffMember> => {
    try {
      const response = await api.get<StaffMember>(`/users/${id}`);
      return response;
    } catch (error: any) {
      console.error('❌ getStaffMember Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }
};
