
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import { useRestaurantStore } from '@/store/restaurant';
import { useToast } from '@/hooks/use-toast';
import { ReportResponse } from '@/types/reports';

interface BaseReportProps<T> {
  queryKey: string;
  fetchFn: (params: {
    restaurantId: string;
    date: string;
    page?: number;
    pageSize?: number;
  }) => Promise<ReportResponse<T>>;
  defaultPageSize?: number;
}

export const useBaseReport = <T,>({
  queryKey,
  fetchFn,
  defaultPageSize = 10
}: BaseReportProps<T>) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  
  const { selectedRestaurant } = useRestaurantStore();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, selectedRestaurant?.id, format(selectedDate, 'yyyy-MM-dd'), page, pageSize],
    queryFn: async () => {
      const response = await fetchFn({
        restaurantId: selectedRestaurant?.id || '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        page,
        pageSize
      });
      
      // Data is already extracted by the axios interceptor
      return response.data;
    },
    enabled: !!selectedRestaurant?.id
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return {
    data,
    isLoading,
    error,
    selectedDate,
    handleDateChange,
    page,
    pageSize,
    handlePageChange,
    refetch,
    restaurantId: selectedRestaurant?.id,
    formatCurrency
  };
};
