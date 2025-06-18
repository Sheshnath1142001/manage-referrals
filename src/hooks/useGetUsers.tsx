import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';
import { AxiosResponse } from 'axios';

export interface User {
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

interface UsersResponse {
  users: User[];
  total: number;
}

export const useGetUsers = () => {
  const { data, isLoading, error, refetch } = useQuery<UsersResponse>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await usersApi.getUsers();
        
        return response; // ✅ Return only data
      } catch (error) {
        
        throw error;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  };
};
