
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { LoginReportApiResponse } from "@/types/api";

export interface LoginReportFilters {
  startDate: string;
  endDate: string;
  userId?: string;
  restaurantId?: string;
}

export function useLoginReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<LoginReportFilters>({
    startDate: "",
    endDate: "",
    userId: "",
    restaurantId: ""
  });

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['login-report', currentPage, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: pageSize.toString(),
        start_date: filters.startDate,
        end_date: filters.endDate,
      });

      if (filters.userId) {
        params.append('user_id', filters.userId);
      }
      if (filters.restaurantId) {
        params.append('restaurant_id', filters.restaurantId);
      }

      const response = await api.get<LoginReportApiResponse>(`/reports/login?${params.toString()}`);
      return response as LoginReportApiResponse;
    },
    enabled: !!(filters.startDate && filters.endDate)
  });

  const loginReports = response?.report || [];
  const totalRecords = response?.totalRecords || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: Partial<LoginReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      userId: "",
      restaurantId: ""
    });
    setCurrentPage(1);
  };

  return {
    // Data
    loginReports,
    totalRecords,
    totalPages,
    currentPage,
    pageSize,
    filters,
    isLoading,
    error,

    // Actions
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
    handleSearch,
    clearFilters,
    refetch
  };
}
