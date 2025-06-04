
import { PaginatedResponse } from '../client';

export interface ItemResponse {
  id: number;
  name: string;
  description: string | null;
  quantity: string;
  quantity_unit: number;
  quantity_units: {
    id: number;
    unit: string;
    status: number;
  };
  price: string;
  online_price: string;
  barcode: string | null;
  discount: string | null;
  online_discount: string | null;
  discount_type: number | null;
  category_id: number;
  categories: {
    id: number;
    category: string;
    status: number;
  };
  status: number;
  created_at: string;
  created_by: string;
  is_offer_half_n_half: number | null;
  half_price: string | null;
  online_half_price: string | null;
  seq_no: number | null;
}

export interface ItemsApiResponse {
  products: ItemResponse[];
  total: number;
}
