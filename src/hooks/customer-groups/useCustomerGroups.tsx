
import { toast } from "sonner";
import { CreateCustomerGroupData, CustomerGroupsResponse } from "@/types/customerGroups";
import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerGroupsApi, CustomerGroup } from "@/services/api/customerGroups";
import { useToast } from "@/hooks/use-toast";

export function useCustomerGroups() {
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  // Fetch customer groups
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['customer-groups', currentPage, pageSize, searchTerm, selectedStatus, selectedRestaurant],
    queryFn: () => customerGroupsApi.getCustomerGroups({
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      restaurant_id: selectedRestaurant || undefined
    })
  });

  const customerGroups = response?.data || [];
  const totalItems = response?.total || 0;
  const totalPages = response?.total_pages || 0;

  // Create customer group mutation
  const createCustomerGroupMutation = useMutation({
    mutationFn: (data: CreateCustomerGroupData) => {
      const payload = {
        name: data.name,
        description: data.description,
        status: data.status,
        user_ids: data.user_ids,
        restaurant_id: data.restaurant_id
      };
      return customerGroupsApi.createCustomerGroup(payload);
    },
    onSuccess: () => {
      toast.success("Customer group created successfully");
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
    },
    onError: (error) => {
      toast.error("Failed to create customer group");
      console.error(error);
    }
  });

  // Update customer group mutation
  const updateCustomerGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CustomerGroup> }) => {
      const payload = {
        name: data.name || "",
        description: data.description || "",
        status: data.status || 1,
        user_ids: data.user_ids || [],
        restaurant_id: data.restaurant_id || 1
      };
      return customerGroupsApi.updateCustomerGroup(id, payload);
    },
    onSuccess: () => {
      toast.success("Customer group updated successfully");
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
    },
    onError: (error) => {
      toast.error("Failed to update customer group");
      console.error(error);
    }
  });

  // Delete customer group mutation
  const deleteCustomerGroupMutation = useMutation({
    mutationFn: (id: number) => customerGroupsApi.deleteCustomerGroup(id),
    onSuccess: () => {
      toast.success("Customer group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
    },
    onError: (error) => {
      toast.error("Failed to delete customer group");
      console.error(error);
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleRestaurantFilter = (restaurantId: number | null) => {
    setSelectedRestaurant(restaurantId);
    setCurrentPage(1);
  };

  return {
    // Data
    customerGroups,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    selectedStatus,
    selectedRestaurant,
    isLoading,
    error,
    
    // Mutations
    createCustomerGroupMutation,
    updateCustomerGroupMutation,
    deleteCustomerGroupMutation,
    
    // Actions
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleStatusFilter,
    handleRestaurantFilter
  };
}
