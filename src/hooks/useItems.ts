import { API_ENDPOINTS, DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '@/components/items/constants';
import { Item } from '@/components/items/types';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const useItems = ({
  categoryPageNumber = 1,
  categoryPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  
  // Debounced search states
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedBarcodeSearch, setDebouncedBarcodeSearch] = useState('');
  
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce barcode search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBarcodeSearch(barcodeSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [barcodeSearch]);

  // Reset to first page when search terms change
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm || debouncedBarcodeSearch !== barcodeSearch) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, debouncedBarcodeSearch, searchTerm, barcodeSearch]);

  // Fetch categories
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response: any = await api.get('/categories', { 
        params: {
          page: categoryPageNumber,
          per_page: categoryPerPage,
          status: 1 // Only fetch active categories
        }
      });
      return response.categories || [];
    },
    // staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Fetch items with React Query using debounced search terms
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', currentPage, pageSize, selectedStatus, selectedCategory, debouncedSearchTerm, debouncedBarcodeSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Only add pagination params if not showing all
      if (pageSize !== -1) {
        params.append('page', currentPage.toString());
        params.append('per_page', pageSize.toString());
      } else {
        // When showing all items
        params.append('page', '1');
        params.append('per_page', '99999');
      }

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }

      if (debouncedSearchTerm) {
        params.append('product_name', debouncedSearchTerm);
      }

      if (debouncedBarcodeSearch) {
        params.append('barcode', debouncedBarcodeSearch);
      }

      const response = await api.get(`${API_ENDPOINTS.PRODUCTS}?${params}`);
      const responseData = response.data || response;
      
      // Transform the new backend response structure
      const transformedItems = (responseData.products || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        quantity_unit: product.quantity_unit,
        quantity_units: product.quantity_units,
        price: product.price,
        online_price: product.online_price,
        barcode: product.barcode,
        discount: product.discount,
        online_discount: product.online_discount,
        discount_type: product.discount_type,
        category_id: product.category_id,
        category: product.categories?.category || '',
        categories: product.categories,
        status: product.status,
        created_at: product.created_at,
        created_by: product.created_by,
        is_offer_half_n_half: product.is_offer_half_n_half,
        half_price: product.half_price,
        online_half_price: product.online_half_price,
        seq_no: product.seq_no,
        restaurant_ids: product.restaurant_ids || []
      }));

      return {
        items: transformedItems,
        total: responseData.total || 0
      };
    },
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Fetch quantity units
  const { data: quantityUnits = [] } = useQuery({
    queryKey: ['quantityUnits'],
    queryFn: async () => {
      const response: any = await api.get('/quantity-units', {
        params: {
          with_pre_defines: 1
        }
      });
      return response.quantity_units || [];
    },
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Fetch discount types
  const { data: discountTypes = [] } = useQuery({
    queryKey: ['discountTypes'],
    queryFn: async () => {
      const response: any = await api.get('/discount-types');
      return response.discount_types || [];
    },
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response: any = await api.get('/restaurants');
      return response.restaurants || [];
    },
    refetchOnMount: true, // Always refetch when component mounts
  });

  const fetchItems = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  }, [queryClient]);

  const toggleItemSelection = (item: Item) => {
    setSelectedItems(prevSelected => {
      const isItemSelected = prevSelected.some(selectedItem => selectedItem.id === item.id);
      
      if (isItemSelected) {
        return prevSelected.filter(selectedItem => selectedItem.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  const toggleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(itemsData?.items || []);
    } else {
      setSelectedItems([]);
    }
  };

  const updateBulkStatus = async (status: number) => {
    try {
      const payload = selectedItems.map(item => ({
        entityType: "products",
        id: item.id,
        data: {
          status: status
        }
      }));
      
      await api.put(`${apiBaseUrl}/bulk-update`, payload);
      
      toast({
        title: "Success",
        description: `Status updated for ${selectedItems.length} items.`
      });
      
      fetchItems();
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update items status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    // Handle "All" option
    const newSize = size === 0 ? -1 : size;
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const cloneItems = async () => {
    try {
      // Create clones for each selected item
      for (const item of selectedItems) {
        // First fetch restaurants for this product
        const response = await api.get('/restaurants-for-product', {
          params: {
            product_id: item.id
          }
        });
        
        const restaurantsData = response.data || response;

        // Extract restaurant IDs from the response
        const restaurantIds = (restaurantsData || []).map((restaurant: any) => 
          restaurant.restaurants.id
        );

        const clonePayload = {
          name: `${item.name}_copy_clone`,
          quantity: item.quantity || 1,
          quantity_unit: item.quantity_unit || 1,
          price: item.price || 0,
          online_price: item.online_price || 0,
          discount: item.discount || 0,
          online_discount: item.online_discount || 0,
          discount_type: item.discount_type || 1,
          is_offer_half_n_half: item.is_offer_half_n_half || 0,
          status: item.status || 1,
          category_id: item.category_id || null,
          module_type: 2,
          restaurant_ids: restaurantIds
        };

        // Make POST request to create clone
        await api.post('/product', clonePayload);
      }
      
      toast({
        title: "Success",
        description: `Cloned ${selectedItems.length} items successfully.`
      });
      
      fetchItems();
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone items. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    items: itemsData?.items || [],
    searchTerm,
    setSearchTerm,
    barcodeSearch,
    setBarcodeSearch,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    pageSize,
    isLoading,
    totalItems: itemsData?.total || 0,
    availableCategories,
    discountTypes,
    quantityUnits,
    locations,
    fetchItems,
    handlePageChange,
    handlePageSizeChange,
    selectedItems,
    setSelectedItems,
    toggleItemSelection,
    toggleSelectAll,
    updateBulkStatus,
    cloneItems
  };
};

