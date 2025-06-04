import { API_ENDPOINTS, DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '@/components/items/constants';
import { Item } from '@/components/items/types';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const useItems = ({
  categoryPageNumber = 1,
  categoryPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const queryClient = useQueryClient();

  // Fetch items with React Query
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', currentPage, pageSize, selectedStatus, selectedCategory, searchTerm],
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

      if (searchTerm) {
        params.append('product_name', searchTerm);
      }

      const response = await api.get(`${API_ENDPOINTS.PRODUCTS}?${params}`);
      const responseData = response.data || response;
      return {
        items: responseData.products || [],
        total: responseData.total || 0
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch categories
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories', { 
        params: {
          page: categoryPageNumber,
          per_page: categoryPerPage
        }
      });
      return response.categories || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch quantity units
  const { data: quantityUnits = [] } = useQuery({
    queryKey: ['quantityUnits'],
    queryFn: async () => {
      const response = await api.get('/quantity-units', {
        params: {
          with_pre_defines: 1
        }
      });
      return response.quantity_units || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch discount types
  const { data: discountTypes = [] } = useQuery({
    queryKey: ['discountTypes'],
    queryFn: async () => {
      const response = await api.get('/discount-types');
      return response.discount_types || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await api.get('/restaurants');
      return response.restaurants || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
      console.error('Error updating bulk status:', error);
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

  return {
    items: itemsData?.items || [],
    searchTerm,
    setSearchTerm,
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
    updateBulkStatus
  };
};
