
import { useQuery } from '@tanstack/react-query';
import { authApi, type MeResponse } from '@/services/api/auth';

export const useCurrentUser = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getMe();
      // Handle both direct data and axios wrapper
      if ('data' in response) {
        return response.data;
      }
      return response;
    },
    enabled: !!localStorage.getItem('token'), // Only fetch if user is logged in
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const currentUser = data?.user;
  const restaurantId = currentUser?.restaurant_id;

  return {
    currentUser,
    restaurantId,
    isLoading,
    error,
    refetch,
  };
};
