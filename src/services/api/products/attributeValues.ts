import { api } from '../client';

// Interface for attribute value creation
export interface CreateAttributeValuePayload {
  value: string;
  display_value: string;
  base_price: string | number;
  status: number;
  is_default: number;
  attribute_id: number;
}

// Create attribute value
export const createAttributeValue = (data: CreateAttributeValuePayload) => {
  return api.post('/v2/products/attribute-values', data);
}; 