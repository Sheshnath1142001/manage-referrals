import { api } from '../client';

export interface Item {
  id: string | number;
  name: string;
  product_code: string;
  description: string;
  price: number;
  sale_price: number;
  discount_type_id: string | number;
  unit_of_measurement: string;
  thumbnail: string;
  seq_no: number;
  status: number;
  category_id: string | number;
  category_name?: string;
  discount_type_name?: string;
}

export interface ItemResponse {
  data: Item[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  products?: Item[];
}

// Get items with optional filtering
export const getItems = (params?: {
  page?: number;
  per_page?: number;
  category_id?: string | number;
  status?: string | number;
  search?: string;
}) => {
  // Format the params for the API endpoint
  const queryParams = {
    page: params?.page || 1,
    per_page: params?.per_page || 10,
    ...params
  };
  
  return api.get('/v2/products', { params: queryParams });
};

// Get a specific item by ID
export const getItem = (id: string | number) => {
  return api.get(`/v2/products/${id}`);
};

// Create a new item
export const createItem = (data: Partial<Item>) => {
  return api.post('/v2/products', data);
};

// Update an existing item
export const updateItem = (id: string | number, data: Partial<Item> | FormData) => {
  const headers = data instanceof FormData
    ? { 'Content-Type': 'multipart/form-data' }
    : { 'Content-Type': 'application/json' };
    
  return api.patch(`/product/${id}`, data, { headers });
};

// Delete an item
export const deleteItem = (id: string | number) => {
  return api.delete(`/v2/products/${id}`);
};

// Import items from a CSV file
export const importItems = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/v2/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Update item sequence number
export const updateItemSequence = (id: string | number, seq_no: number) => {
  return api.put(`/v2/products/${id}/sequence`, { seq_no });
};

// Export the API functions
export const itemsApi = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  importItems,
  updateItemSequence
};
