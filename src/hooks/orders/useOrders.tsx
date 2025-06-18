import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { paymentMethodsService } from "@/services/api/items/paymentMethods";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
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
  const { restaurants: restaurantList } = useGetRestaurants();
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

  // Add debounced search term state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 1000); // 1000ms delay (1 second)

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // State for filter options
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [orderTypes, setOrderTypes] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);

  // Update restaurants when restaurantList changes
  useEffect(() => {
    if (restaurantList && restaurantList.length > 0) {
      setRestaurants(restaurantList.filter((restaurant: any) => restaurant.status === 1));
    }
  }, [restaurantList]);

  // Debug effect to log filter states
  useEffect(() => {
    console.log('Filter options state updated:', {
      platforms: platforms.length,
      paymentMethods: paymentMethods.length,
      orderTypes: orderTypes.length,
      orderStatuses: orderStatuses.length,
      restaurants: restaurants.length,
      staffMembers: staffMembers.length
    });
    
    // Debug: log the actual data
    console.log('Actual filter data:', {
      platforms,
      paymentMethods,
      orderTypes,
      orderStatuses,
      restaurants,
      staffMembers
    });
  }, [platforms, paymentMethods, orderTypes, orderStatuses, restaurants, staffMembers]);

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

      

      // Fetch all filter options with proper error handling for each endpoint
      const fetchWithErrorHandling = async (urls: string[], defaultValue: any[]) => {
        for (const url of urls) {
          try {
            const response = await fetch(url, { headers });
            if (response.ok) {
              const data = await response.json();
              
              return data;
            } else {
              
            }
          } catch (error) {
            
          }
        }
        
        return defaultValue;
      };

      // Try multiple endpoint variations for each data type
      const [
        platformsData,
        paymentMethodsData,
        orderTypesData,
        orderStatusesData,
        staffResponse
      ] = await Promise.all([
        // Platforms - based on your API response, this should work
        fetchWithErrorHandling([
          `${apiBaseUrl}/order-platforms`,
          `${apiBaseUrl}/platforms`
        ], []),
        
        // Payment methods - using the working service first, then fallback
        paymentMethodsService.getPaymentMethods().then(response => {
          
          return response.data || response;
        }).catch((error) => {
          
          return fetchWithErrorHandling([
            `${apiBaseUrl}/payment-methods`
          ], { payment_methods: [] });
        }),
        
        // Order types - based on your API response structure
        fetchWithErrorHandling([
          `${apiBaseUrl}/order-types`
        ], { order_types: [] }),
        
        // Order statuses - based on OrderStatus.tsx working implementation
        fetchWithErrorHandling([
          `${apiBaseUrl}/order-statuses`
        ], { order_statuses: [] }),
        
        // Staff members
        fetchWithErrorHandling([
          `${apiBaseUrl}/users-without-customers`
        ], { users: [] })
      ]);

      // Set platforms with proper handling - platforms response is a direct array
      if (Array.isArray(platformsData)) {
        setPlatforms(platformsData); // No status filtering for platforms as they don't have status field
      } else if (platformsData?.data && Array.isArray(platformsData.data)) {
        setPlatforms(platformsData.data);
      } else {
        
        setPlatforms([]);
      }

      // Set payment methods with proper handling
      if (paymentMethodsData?.payment_methods && Array.isArray(paymentMethodsData.payment_methods)) {
        setPaymentMethods(paymentMethodsData.payment_methods.filter((pm: any) => pm.status === 1));
      } else if (Array.isArray(paymentMethodsData)) {
        setPaymentMethods(paymentMethodsData.filter((pm: any) => pm.status === 1));
      } else {
        
        setPaymentMethods([]);
      }

      // Set order types with proper handling
      if (orderTypesData?.order_types && Array.isArray(orderTypesData.order_types)) {
        setOrderTypes(orderTypesData.order_types.filter((ot: any) => ot.status === 1));
      } else if (Array.isArray(orderTypesData)) {
        setOrderTypes(orderTypesData.filter((ot: any) => ot.status === 1));
      } else {
        
        setOrderTypes([]);
      }

      // Set order statuses with proper handling
      if (orderStatusesData?.order_statuses && Array.isArray(orderStatusesData.order_statuses)) {
        setOrderStatuses(orderStatusesData.order_statuses.filter((os: any) => os.status === 1));
      } else if (Array.isArray(orderStatusesData)) {
        setOrderStatuses(orderStatusesData.filter((os: any) => os.status === 1));
      } else {
        
        setOrderStatuses([]);
      }

      // Set staff members with proper handling
      if (staffResponse?.users && Array.isArray(staffResponse.users)) {
        setStaffMembers(staffResponse.users.filter((user: any) => user.status === 1));
      } else if (Array.isArray(staffResponse)) {
        setStaffMembers(staffResponse.filter((user: any) => user.status === 1));
      } else {
        
        setStaffMembers([]);
      }

      console.log('Filter options loaded successfully:', {
        platforms: platformsData?.length || 0,
        paymentMethods: paymentMethodsData?.payment_methods?.length || 0,
        orderTypes: orderTypesData?.order_types?.length || 0,
        orderStatuses: orderStatusesData?.order_statuses?.length || 0,
        staffMembers: staffResponse?.users?.length || staffResponse?.total || 0
      });

    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load filter options. Please refresh the page.",
        variant: "destructive"
      });
      
      // Set empty arrays instead of mock data for dynamic API responses
      setPlatforms([]);
      setPaymentMethods([]);
      setOrderTypes([]);
      setOrderStatuses([]);
      setStaffMembers([]);
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
      
      // Use debounced search term instead of filters.searchTerm
      if (debouncedSearchTerm) {
        apiUrl.searchParams.append('search_term', debouncedSearchTerm);
      }

      // Map frontend filter keys to backend API parameter names
      const filterKeyMap: Record<string, string> = {
        platform: 'platform_id',
        paymentMethod: 'payment_type_id',
        orderType: 'type',
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
    debouncedSearchTerm, // Use debouncedSearchTerm instead of filters.searchTerm
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
