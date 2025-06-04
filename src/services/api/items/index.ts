// Re-export items and related services
import { ItemResponse } from './types';
import * as items from './items';
import { attributeValuesService } from './attributeValues';
import * as discountTypes from './discountTypes';
import * as productAttributes from './productAttributes';
import * as productAttributeValues from './productAttributeValues';
import * as productMatrices from './productMatrices';
import * as quantityUnits from './quantityUnits';
import * as restaurantProducts from './restaurantProducts';

// Export types from types.ts
export type { ItemResponse };

// Export attributeValuesService directly
export { attributeValuesService };

// Also export as attributeValuesApiService for backward compatibility
export const attributeValuesApiService = attributeValuesService;

// Combine and re-export all itemsApi methods
export const itemsApi = {
  ...items,
  attributeValuesService,
  attributeValuesApiService,
  discountTypes,
  productAttributes,
  productAttributeValues,
  productMatrices,
  quantityUnits,
  restaurantProducts
};

export * from './restaurantsForProduct';
