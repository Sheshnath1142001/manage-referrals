
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customersApi, Customer } from "@/services/api/customers";
import { useToast } from "@/hooks/use-toast";

export const useCustomers = (initialParams?: {
  page?: number;
  per_page?: number;
  status?: string;
  email?: string;
  phone?: string;
}) => {
  const [page, setPage] = useState(initialParams?.page || 1);
  const [pageSize, setPageSize] = useState(initialParams?.per_page || 100);
  const [statusFilter, setStatusFilter] = useState<string>(initialParams?.status || "all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customers", page, pageSize, statusFilter, searchTerm],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        per_page: pageSize,
        search: searchTerm || undefined,
      };
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      try {
        const response = await customersApi.getCustomers(params);
        
        return {
          customers: response.customers || [],
          total: response.total || 0,
          page: page,
          per_page: pageSize,
          total_pages: Math.ceil((response.total || 0) / pageSize)
        };
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive",
        });
        
        return {
          customers: [],
          total: 0,
          page: 1,
          per_page: pageSize,
          total_pages: 0
        };
      }
    },
  });

  // Safe access of data with default empty array
  const customers: Customer[] = data?.customers || [];
  const totalItems: number = data?.total || 0;
  const totalPages: number = data?.total_pages || 0;

  return {
    customers,
    totalItems,
    currentPage: page,
    pageSize,
    isLoading,
    refetch,
    setPage,
    setPageSize,
    setStatusFilter,
    setSearchTerm,
  };
};
