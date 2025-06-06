export interface Item {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  category_id?: number;
  quantity?: number;
  quantity_unit?: string;
  quantity_unit_id?: number;
  price?: number;
  online_price?: number;
  discount?: string;
  online_discount?: string;
  discount_type?: string;
  discount_type_id?: number;
  description?: string;
  seq_no?: number;
  is_available_online?: boolean;
  status: number;
  image?: string;
  is_offer_half_n_half?: boolean;
}

export interface ItemFormData {
  name: string;
  category_id: number;
  quantity: string;
  quantity_unit_id: number;
  barcode: string;
  price: string;
  online_price: string;
  locations: string[];
  discount_type_id: number;
  discount: string;
  module_type: number;
  online_discount: string;
  description: string;
  image: File | null;
  imageToken: string;
  imagePreview: string;
  status: number;
}

export interface ItemUpdatePayload {
  name: string;
  category_id: number;
  quantity: number;
  quantity_unit: number;
  barcode: string | null;
  description: string | null;
  price: number;
  online_price: number;
  discount: number;
  discount_type: number;
  module_type: number;
  online_discount: number;
  status: number;
  is_offer_half_n_half: number;
  restaurant_ids?: number[];
}

export interface BulkEditFormData {
  price?: string;
  online_price?: string;
  category_id?: number;
  quantity_unit_id?: number;
  discount_type_id?: number;
  discount?: string;
  online_discount?: string;
  status?: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  products?: Item[];
  product?: Item;
  total?: number;
}

export interface BulkUpdateResponse {
  success: boolean;
  message?: string;
  updated_count?: number;
}