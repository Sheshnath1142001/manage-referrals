import { api, PaginatedResponse } from './client';
import { BulkUpdateResponse } from '@/components/items/types';

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export interface Item {
  id: string | number;
  name: string;
  description?: string;
  price?: number;
  sale_price?: number;
  online_price?: number;
  category_id?: string | number;
  category_name?: string;
  image?: string;
  thumbnail?: string;
  status: 'Active' | 'Inactive' | number;
  seqNo?: number;
  seq_no?: number;
  barcode?: string;
  product_code?: string;
  sku?: string;
  discount_type_id?: string | number;
  discount_type_name?: string;
  online_discount?: string | number;
}

export interface ItemResponse extends PaginatedResponse<Item> {
  data: Item[];
  products?: Item[];
}

// Create a discountTypes submodule
const discountTypes = {
  getAll: () => api.get<any>('/discount-types')
};

export const itemsApi = {
  getItems: async (params?: {
    page?: number;
    per_page?: number;
    category_id?: number | string;
    status?: string | number;
    search?: string;
  }) => {
    try {
      const response = await api.get<any>('/items', { params });
      
      // Our interceptor returns response.data directly
      // Handle different API response formats
      let items: Item[] = [];
      let total = 0;
      let page = params?.page || 1;
      let perPage = params?.per_page || 10;
      
      if (response && typeof response === 'object') {
        const responseData = response.data;
        const isArray = Array.isArray(responseData);
        
        if (isArray) {
          items = responseData;
          total = items.length;
        } else if (responseData.products && Array.isArray(responseData.products)) {
          items = responseData.products;
          total = responseData.total || items.length;
          page = responseData.page || page;
          perPage = responseData.per_page || perPage;
        }
      }
      
      return {
        data: items,
        products: items, // For backward compatibility
        total: total,
        page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage)
      } as ItemResponse;
    } catch (error) {
      console.error('Error fetching items:', error);
      return {
        data: [],
        products: [],
        total: 0,
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        total_pages: 0
      } as ItemResponse;
    }
  },

  getItem: (id: string | number) => api.get<Item>(`/items/${id}`),

  createItem: (data: FormData | Partial<Omit<Item, 'id'>>) => 
    api.post<Item>('/product', data, {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    }),

  updateItem: (id: string | number, data: FormData | Partial<Omit<Item, 'id'>>) => {
    // Ensure proper content type headers
    const headers = data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
      
    // Use the correct endpoint format
    return api.patch<any>(`/product/${id}`, data, { headers });
  },

  deleteItem: (id: string | number) => api.delete(`/items/${id}`),
  
  updateItemSequence: (id: string | number, seqNo: number) => 
    api.put<Item>(`/items/${id}/sequence`, { seq_no: seqNo }),
    
  exportItems: (format: 'csv' | 'excel' = 'csv') => 
    api.get(`/items/export?format=${format}`, { responseType: 'blob' }),
    
  importItems: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/items/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Add bulk update functionality
  bulkUpdate: (data: {
    ids: (string | number)[];
    price?: number | string;
    online_price?: number | string;
    status?: number;
    category_id?: string | number;
    quantity_unit_id?: string | number;
    discount_type_id?: string | number;
    discount?: string | number;
    online_discount?: string | number;
  }) => {
    return api.post<BulkUpdateResponse>('/products/bulk-update', data);
  },
  
  bulkUpdateStatus: (ids: (string | number)[], status: number) => {
    const payload = ids.map(id => ({
      entityType: "products",
      id,
      data: {
        status
      }
    }));
    
    return api.put<BulkUpdateResponse>(`${apiBaseUrl}/bulk-update`, payload);
  },
  
  // Add the discountTypes submodule
  discountTypes
};
