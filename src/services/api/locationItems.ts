import { api } from './client';
import { LocationItemResponse, LocationItemsApiParams, UpdateLocationItemData, BulkUpdateItem } from '@/types/locationItems';

export const locationItemsApi = {
  // Get location items with pagination and filters
  getLocationItems: (params: LocationItemsApiParams) => 
    api.get<LocationItemResponse>('/restaurant-products', { params }),

  // Update a single location item
  updateLocationItem: (id: string, data: UpdateLocationItemData) =>
    api.put(`/restaurant-products/${id}`, data),

  // Bulk update multiple items
  bulkUpdate: (items: BulkUpdateItem[]) => 
    api.post('/v2/bulk-update', items),

  // Clone items from one location to another using the correct endpoint
  cloneItems: (sourceLocationId: string, targetLocationId: string) =>
    api.post(`/v2/products/clone-to-location/${sourceLocationId}/${targetLocationId}`),

  // Add a product tag
  addProductTag: (data: { restaurant_product_id: string | number; tag_id: string | number }) =>
    api.post('/restaurant-product-tags', data),

  // Remove a product tag
  removeProductTag: (restaurantProductId: string | number, tagId: string | number) =>
    api.delete(`/restaurant-product-tags/${restaurantProductId}/${tagId}`),

  // Get tags by name
  getTagsByName: (tagNames: string[]) =>
    api.post('/tags/by-names', { names: tagNames }),

  // Create multiple restaurant product modifiers
  createMultipleRestaurantProductModifiers: (modifiers: any[]) =>
    api.post('/restaurant-product-modifiers/multiple', { restaurant_product_modifiers: modifiers }),

  // Update product modifiers
  updateProductModifiers: (id: string, data: any) =>
    api.put(`/restaurant-products/${id}/modifiers`, data)
};
