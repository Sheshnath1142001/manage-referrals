export type AttributeType = 'text' | 'number' | 'single_select' | 'multi_select';

// API Response types (what comes from the server)
export interface AttributeValueApiResponse {
  id: number;
  attribute_id: number;
  value: string;
  display_value: string;
  base_price: string | number;
  is_default: number;
  sequence: number;
  seq_no?: number;
  status: number;
}

export interface ProductAttributeApiResponse {
  id: number;
  name: string;
  display_name: string;
  attribute_type: AttributeType;
  is_required: number;
  min_selections: number;
  max_selections: number;
  sequence: number;
  status: number;
}

// Internal types (what we use in components)
export interface AttributeValue {
  id: number;
  attribute_id: number;
  name: string;
  display_name: string;
  base_price: number;
  is_default: number;
  sequence: number;
  seq_no?: number;
  status: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  display_name: string;
  attribute_type: AttributeType;
  is_required: number;
  min_selections: number;
  max_selections: number;
  sequence: number;
  status: number;
  restaurant_id?: number;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface ProductAttributesFilterParams {
  status?: string;
  name?: string;
  page?: number;
  per_page?: number;
}

// API Response wrappers
export interface AttributeValuesApiResponse {
  attribute_values: AttributeValueApiResponse[];
  total?: number;
}

export interface ProductAttributesApiResponse {
  attributes: ProductAttributeApiResponse[];
  total?: number;
  pagination?: {
    page: number;
    per_page: number;
    total_pages: number;
  };
}
