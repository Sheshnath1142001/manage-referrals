
import { api } from './client';

export interface RestaurantSettings {
  id: number;
  restaurant_id: number;
  restaurants: {
    id: number;
    name: string;
    type: number;
    restaurant_type: number;
    status: number;
    logo_image_id: number | null;
    owner_id: string;
    created_by: string;
    created_at: string;
    updated_by: string | null;
    updated_at: string;
    restaurant_unique_id: string;
    receiver_email: string;
    timezone: string;
    company_code: string | null;
    customer_website_url: string | null;
    restaurant_order_type_otm: Array<{
      id: number;
      restaurant_id: number;
      order_type_id: number;
    }>;
  };
  phone_no: string;
  payment_methods: {
    id: number;
    method: string;
    description: string | null;
    status: number;
    created_at: string;
  };
  product_vendor_name: string;
  product_name: string;
  authorized_discount: number;
  product_version: string;
  site_reference: string;
  address_line_1: string;
  address_line_2: string;
  show_product_offer_popup: number;
  gst_tax_rate: string;
  gst_ratio: string;
  expected_floating_amount: string;
  status: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  abn: string;
  tyro_api_key: string | null;
  paring_secret: string;
  is_refer_program_required: number | null;
  is_spent_reward_program_required: number | null;
  order_discount_type: number;
  order_fixed_discount: string;
  order_surcharge_type: number;
  order_fixed_surcharge: string;
  is_deliverable: number;
  min_order_value_to_avail_disc: string;
  fixed_delivery_charge: string;
  pickup_time_duration: string;
  is_dine_in_enabled: number;
  is_giftcard_feature_enabled: number;
  is_online_order_enabled: number;
  is_cloud_printing_enabled: number;
}

export interface RestaurantSettingsResponse {
  restaurant_settings: RestaurantSettings[];
}

export interface RestaurantSettingsUpdatePayload {
  abn: string;
  address_line_1: string;
  address_line_2: string;
  fixed_delivery_charge: string;
  is_deliverable: number;
  is_dine_in_enabled: number;
  is_giftcard_feature_enabled: number;
  min_order_value_to_avail_disc: string;
  order_discount_type: number;
  order_fixed_discount: string;
  order_fixed_surcharge: string;
  order_surcharge_type: number;
  phone_no: string;
  pickup_time_duration: string;
  site_reference: string;
  is_cloud_printing_enabled?: number;
  paring_secret: string;
}

// Get restaurant settings
export const getRestaurantSettings = async (restaurantId: number): Promise<any> => {
  try {
    const response = await api.get(`/restaurant-settings?restaurant_id=${restaurantId}`);
    return response;
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    throw error;
  }
};

// Update restaurant settings - using restaurant_id in the endpoint
export const updateRestaurantSettings = async (restaurantId: number, data: RestaurantSettingsUpdatePayload): Promise<any> => {
  try {
    // Ensure all required fields are present with proper values
    const payload = {
      ...data,
      // Convert string numbers to proper format
      fixed_delivery_charge: data.fixed_delivery_charge || "0",
      min_order_value_to_avail_disc: data.min_order_value_to_avail_disc || "0",
      order_fixed_discount: data.order_fixed_discount || "0",
      order_fixed_surcharge: data.order_fixed_surcharge || "0",
      pickup_time_duration: data.pickup_time_duration || "30",
      // Ensure boolean values are converted to numbers
      is_deliverable: Number(data.is_deliverable),
      is_dine_in_enabled: Number(data.is_dine_in_enabled),
      is_giftcard_feature_enabled: Number(data.is_giftcard_feature_enabled),
      is_cloud_printing_enabled: Number(data.is_cloud_printing_enabled || 0),
      // Ensure discount and surcharge types are numbers
      order_discount_type: Number(data.order_discount_type),
      order_surcharge_type: Number(data.order_surcharge_type),
      // Add paring_secret with fallback value
      paring_secret: data.paring_secret || "default_secret",
    };

    console.log('Updating restaurant settings with payload:', payload);
    // Changed endpoint to use restaurant_id instead of settings_id
    const response = await api.patch(`/restaurant-settings/${restaurantId}`, payload);
    return response;
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    throw error;
  }
};

export const restaurantSettingsApi = {
  getRestaurantSettings,
  updateRestaurantSettings
};
