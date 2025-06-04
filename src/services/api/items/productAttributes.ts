import { api } from '../client';
import { ProductAttributesFilterParams, AttributeType } from '@/types/productAttributes';

// Interface for attribute creation/update
export interface AttributePayload {
  name: string;
  display_name: string;
  min_selections: number;
  max_selections: number;
  is_required: number;
  attribute_type: AttributeType;
  status: number;
}

// Interface for sequence update
export interface UpdateSequencePayload {
  id: number;
  new_seq_no: number;
}

// Interface for pagination
export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_more: boolean;
}

// Product attributes related operations
export const attributesService = {
  // Get product attributes
  getProductAttributes: (params: ProductAttributesFilterParams) => {
    // Create URLSearchParams to ensure exact parameter order
    const urlParams = new URLSearchParams();
    
    // Set parameters in the exact order required: atrribute, page, per_page
    if (params.name) urlParams.set('atrribute', params.name);
    urlParams.set('page', String(params.page || 1));
    urlParams.set('per_page', String(params.per_page || 10));
    if (params.status) urlParams.set('status', params.status);
    
    // Convert to string and remove leading '?'
    const queryString = urlParams.toString();
    
    // Make the API request with the formatted query string
    return api.get(`/v2/products/attributes?${queryString}`);
  },

  // Create attribute
  createAttribute: (data: AttributePayload) => {
    return api.post('/v2/products/attributes', data);
  },

  // Update attribute
  updateAttribute: (id: number, data: AttributePayload) => {
    return api.put(`/v2/products/attributes/${id}`, data);
  },

  // Update sequence
  updateSequence: (data: UpdateSequencePayload) => {
    return api.patch('/v2/products/attributes-seq', data);
  }
};
