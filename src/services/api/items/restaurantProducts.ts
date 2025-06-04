import { api } from '../client';

interface GetRestaurantProductsParams {
  page?: number;
  per_page?: number;
  restaurant_id?: number | string;
  product_name?: string;
  category_id?: number | string;
  status?: number;
  is_online?: number;
}

// Restaurant products related operations
const getRestaurantProducts = (params: GetRestaurantProductsParams) => {
  const queryParams = new URLSearchParams();
  
  // Add pagination params
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.per_page) queryParams.append('per_page', params.per_page.toString());
  
  // Add filter params - always include these filters, even if empty
  queryParams.append('restaurant_id', params.restaurant_id?.toString() || '');
  queryParams.append('product_name', params.product_name || '');
  if (params.category_id) queryParams.append('category_id', params.category_id.toString());
  if (typeof params.status !== 'undefined') queryParams.append('status', params.status.toString());
  if (typeof params.is_online !== 'undefined') queryParams.append('is_online', params.is_online.toString());
  
  return api.get(`/restaurant-products?${queryParams.toString()}`);
};

const createRestaurantProducts = (data: any) => api.post('/restaurant-products', data);

const deleteRestaurantProduct = (params: any) => api.delete(`/restaurant-products/${params.id}`);

const cloneRestaurantProducts = (params: any) => api.post('/restaurant-products/clone', params);

export const restaurantProductsService = {
  getRestaurantProducts,
  createRestaurantProducts,
  deleteRestaurantProduct,
  cloneRestaurantProducts
};
