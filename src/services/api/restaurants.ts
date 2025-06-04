import { api } from './client';

export interface Restaurant {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  status: number;
}

export interface RestaurantResponse {
  data: Restaurant[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface RestaurantType {
  id: number;
  type: string;
}

// Get all restaurants
export const getRestaurants = (params?: {
  page?: number;
  per_page?: number;
  status?: string | number;
}) => {
  return api.get<RestaurantResponse>('/restaurants', { params });
};

// Get a specific restaurant
export const getRestaurant = (id: string | number) => {
  return api.get(`/restaurants/${id}`);
};

// Create a new restaurant
export const createRestaurant = (data: {
  restaurant_id: number;
  phone_no: string;
  product_vendor_name: string;
  product_name: string;
  authorized_discount: number;
  product_version: string;
  site_reference: string;
  address_line_1: string;
  address_line_2: string;
  show_product_offer_popup: boolean;
  gst_tax_rate: number;
  gst_ratio: number;
  expected_floating_amount: number;
  status: number;
  abn: string;
  tyro_api_key: string;
  paring_secret: string;
  is_refer_program_required: boolean;
  is_spent_reward_program_required: boolean;
  order_discount_type: number;
  order_fixed_discount: number;
  order_surcharge_type: number;
  order_fixed_surcharge: number;
  is_deliverable: boolean;
  min_order_value_to_avail_disc: number;
  fixed_delivery_charge: number;
  pickup_time_duration: number;
  is_dine_in_enabled: boolean;
  is_giftcard_feature_enabled: boolean;
  is_online_order_enabled: boolean;
  is_cloud_printing_enabled: boolean;
}) => {
  return api.post('/restaurant/settings', data);
};

// Update a restaurant
export const updateRestaurant = (id: string | number, data: {
  phone_no?: string;
  product_vendor_name?: string;
  product_name?: string;
  authorized_discount?: number;
  product_version?: string;
  site_reference?: string;
  address_line_1?: string;
  address_line_2?: string;
  show_product_offer_popup?: boolean;
  gst_tax_rate?: number;
  gst_ratio?: number;
  expected_floating_amount?: number;
  status?: number;
  abn?: string;
  tyro_api_key?: string;
  paring_secret?: string;
  is_refer_program_required?: boolean;
  is_spent_reward_program_required?: boolean;
  order_discount_type?: number;
  order_fixed_discount?: number;
  order_surcharge_type?: number;
  order_fixed_surcharge?: number;
  is_deliverable?: boolean;
  min_order_value_to_avail_disc?: number;
  fixed_delivery_charge?: number;
  pickup_time_duration?: number;
  is_dine_in_enabled?: boolean;
  is_giftcard_feature_enabled?: boolean;
  is_online_order_enabled?: boolean;
  is_cloud_printing_enabled?: boolean;
}) => {
  return api.patch(`/restaurant/settings/${id}`, data);
};

// Delete a restaurant
export const deleteRestaurant = (id: string | number) => {
  return api.delete(`/restaurants/${id}`);
};

export const restaurantsApi = {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantTypes: async (): Promise<RestaurantType[]> => {
    const response = await api.get('/restaurant-types');
    return response;
  }
};
