import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { staffApi } from "@/services/api/staff";
import { format } from "date-fns";

interface OrderFilters {
  platform: string;
  paymentMethod: string;
  orderType: string;
  attendant: string;
  location: string;
  status: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const useOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<OrderFilters>({
    platform: "all",
    paymentMethod: "all",
    orderType: "all",
    attendant: "all",
    location: "all",
    status: "all",
    startDate: undefined,
    endDate: undefined,
    searchTerm: "",
  });

  // State for filter options
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [orderTypes, setOrderTypes] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      const { token } = JSON.parse(adminData);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const [
        platformsResponse,
        paymentMethodsResponse,
        orderTypesResponse,
        orderStatusesResponse,
        restaurantsResponse,
        staffResponse
      ] = await Promise.all([
        fetch(`${apiBaseUrl}/order-platforms`, { headers }),
        fetch(`${apiBaseUrl}/payment-methods`, { headers }),
        fetch(`${apiBaseUrl}/order-types`, { headers }),
        fetch(`${apiBaseUrl}/order-statuses`, { headers }),
        fetch(`${apiBaseUrl}/restaurants?per_page=100000`, { headers }),
        staffApi.getStaffMembers(1, 100000, 1) // Get active staff members
      ]);
      const [
        platformsData,
        paymentMethodsData,
        orderTypesData,
        orderStatusesData,
        restaurantsData
      ] = await Promise.all([
        platformsResponse.json(),
        paymentMethodsResponse.json(),
        orderTypesResponse.json(),
        orderStatusesResponse.json(),
        restaurantsResponse.json()
      ]);
      setPlatforms(platformsData);
      setPaymentMethods(paymentMethodsData.payment_methods.filter((pm: any) => pm.status === 1));
      setOrderTypes(orderTypesData.order_types.filter((ot: any) => ot.status === 1));
      setOrderStatuses(orderStatusesData.order_statuses.filter((os: any) => os.status === 1));
      setRestaurants(restaurantsData.restaurants.filter((restaurant: any) => restaurant.status === 1));
      setStaffMembers(staffResponse.users || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast({
        title: "Error",
        description: "Failed to load filter options. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      const { token } = JSON.parse(adminData);
      const offset = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
      const limit = itemsPerPage === -1 ? 100000 : itemsPerPage; // Use a large number for "All"
      const apiUrl = new URL(`${apiBaseUrl}/v2/orders`);
      apiUrl.searchParams.append('offset', offset.toString());
      apiUrl.searchParams.append('limit', limit.toString());
      
      // Add date range filters
      if (filters.startDate) {
        apiUrl.searchParams.append('start_date', format(filters.startDate, 'dd-MM-yyyy'));
      }
      if (filters.endDate) {
        apiUrl.searchParams.append('end_date', format(filters.endDate, 'dd-MM-yyyy'));
      }
      
      // Add search term
      if (filters.searchTerm) {
        apiUrl.searchParams.append('search_term', filters.searchTerm);
      }

      // Map frontend filter keys to backend API parameter names
      const filterKeyMap: Record<string, string> = {
        platform: 'platform_id',
        paymentMethod: 'payment_type_id',
        orderType: 'order_type_id',
        attendant: 'created_by',
        location: 'restaurant_id',
        status: 'status',
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "all" && filterKeyMap[key] && typeof value === 'string') {
          apiUrl.searchParams.append(filterKeyMap[key], value);
        }
      });
      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage, 
    itemsPerPage, 
    filters.platform,
    filters.paymentMethod,
    filters.orderType,
    filters.attendant,
    filters.location,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.searchTerm,
    toast
  ]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleDateChange = (filterName: string, date: Date | undefined) => {
    setFilters(prev => ({ ...prev, [filterName]: date }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === "-1" ? -1 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    orders,
    isLoading,
    currentPage,
    totalItems,
    itemsPerPage,
    filters,
    platforms,
    paymentMethods,
    orderTypes,
    orderStatuses,
    restaurants,
    staffMembers,
    handleFilterChange,
    handleDateChange,
    handlePageChange,
    handleItemsPerPageChange,
    fetchOrders,
  };
};
