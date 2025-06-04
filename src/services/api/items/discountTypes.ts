
import { api } from '../client';

// Interface for discount types
export interface DiscountType {
  id: string | number;
  name: string;
  status: number;
}

// Get discount types
export const getDiscountTypes = (params?: { status?: number }) => {
  return api.get('/discount-types', { params });
};

export const discountTypesService = {
  getDiscountTypes
};
