
import { useState, useEffect, useCallback } from 'react';
import { itemsApi } from '@/services/api/items';
import { AxiosError } from 'axios';
import { Item } from '@/components/items/types';

export function useItemsData() {
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [discountTypes, setDiscountTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    status: '1', // Set active status (1) as default
    search: '',
    category_id: ''
  });

  // Function to fetch items with optional filters
  const fetchItems = useCallback(async (customFilters?: Partial<typeof filters>) => {
    setIsLoading(true);
    const queryParams = { ...filters, ...customFilters };
    
    try {
      const response = await itemsApi.getItems(queryParams);
      
      
      // Handle different API response formats
      let items = [];
      let total = 0;
      
      if (response) {
        // Check for different data structures in the response
        if (Array.isArray(response.data)) {
          items = response.data;
          total = response.total || items.length;
        } else if (response.products && Array.isArray(response.products)) {
          items = response.products;
          total = response.total || items.length;
        }
      }
      
      // Type assertions for Item interface compatibility
      const formattedItems: Item[] = items.map((item: any) => ({
        id: item.id,
        name: item.name || '',
        quantity: item.quantity?.toString() || "0",
        quantity_unit_id: item.quantity_unit_id || 0,
        quantity_unit: item.quantity_unit || '',
        price: item.price?.toString() || "0",
        online_price: item.sale_price?.toString() || item.online_price?.toString() || "0",
        barcode: item.product_code || item.barcode || '',
        description: item.description || '',
        category: item.category_name || '',
        category_id: item.category_id || 0,
        seq_no: item.seq_no || 0,
        status: typeof item.status === 'string' ? (item.status === 'Active' ? 1 : 0) : (item.status || 0),
        discount_type_id: item.discount_type_id || 0,
        discount: item.discount_type_name || '',
        online_discount: item.online_discount?.toString() || "0",
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
      
      setItemsList(formattedItems);
      setTotalItems(total);
    } catch (error) {
      
      const axiosError = error as AxiosError;
      
      setItemsList([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch discount types
  const fetchDiscountTypes = async () => {
    try {
      // Use the discountTypes submodule from itemsApi
      const response = await itemsApi.discountTypes.getAll();
      
      if (response && Array.isArray(response.data)) {
        setDiscountTypes(response.data);
      } else if (response && response.data && Array.isArray(response.data.data)) {
        setDiscountTypes(response.data.data);
      } else {
        setDiscountTypes([]);
      }
    } catch (error) {
      
      setDiscountTypes([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Helper function for formatting
  const titleCase = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return {
    itemsList,
    totalItems,
    isLoading,
    filters,
    setFilters,
    fetchItems,
    fetchDiscountTypes,
    discountTypes,
    titleCase
  };
}
