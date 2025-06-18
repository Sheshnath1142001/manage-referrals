import { useQuery } from '@tanstack/react-query';
import { customerDisplayApi, AspectRatioOption, GroupType } from '@/services/api/customerDisplay';

export const useCustomerDisplayOptions = () => {
  // Fetch aspect ratios
  const {
    data: aspectRatios = [],
    isLoading: aspectRatiosLoading,
    error: aspectRatiosError,
  } = useQuery({
    queryKey: ['aspectRatios'],
    queryFn: () => customerDisplayApi.getAspectRatios(),
    staleTime: 10 * 60 * 1000, // 10 minutes - this data doesn't change often
  });

  // Fetch group types
  const {
    data: groupTypes = [],
    isLoading: groupTypesLoading,
    error: groupTypesError,
  } = useQuery({
    queryKey: ['customerDisplayGroupTypes'],
    queryFn: () => customerDisplayApi.getGroupTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    aspectRatios,
    groupTypes,
    isLoading: aspectRatiosLoading || groupTypesLoading,
    aspectRatiosLoading,
    groupTypesLoading,
    error: aspectRatiosError || groupTypesError,
    aspectRatiosError,
    groupTypesError,
  };
}; 