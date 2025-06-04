export interface LocationItemResponse {
  restaurant_products: any[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface LocationItemUpdateParams {
  id: string;
  data: {
    price?: number | string;
    online_price?: number | string;
    status?: number;
    is_online?: number;
    product_id?: number | string;
  };
}

export interface ModifierUpdateParams {
  id: string;
  modifiers: {
    price?: number | string;
    online_price?: number | string;
    half_price?: number | string;
    online_half_price?: number | string;
  };
}

export interface CloneItemsParams {
  sourceLocation: string;
  targetLocation: string;
  items: number[];
}

export interface LocationItemsApiParams {
  page?: number;
  per_page?: number;
  restaurant_id?: string;
  status?: string;
  search?: string;
}

export interface UpdateLocationItemData {
  price?: number;
  online_price?: number;
  is_online?: number;
  status?: number;
  product_id?: number;
  discount?: number;
  online_discount?: number;
  discount_type?: number;
  restrict_attribute_combinations?: number;
  is_offer_half_n_half?: number;
}

export interface AddProductTagData {
  tag_id: number;
  restaurant_product_id: number | string;
}

export interface ProductTag {
  id: number | string;
  tag: string;
}

export interface UpdateModifiersData {
  modifiers: any[];
}

export interface BulkUpdateItem {
  entityType: string;
  id: string;
  data: {
    [key: string]: any;
  };
}

export interface RestaurantProductModifier {
  restaurant_product_id: number;
  modifier_id: number;
  price: number;
  online_price: number;
  half_price: number | null;
  online_half_price: number | null;
  status?: number;
}

export interface LocationItemsApi {
  getLocationItems: (params: LocationItemsApiParams) => Promise<LocationItemResponse>;
  updateLocationItem: (id: string, data: UpdateLocationItemData) => Promise<any>;
  updateProductModifiers: (id: string, data: UpdateModifiersData) => Promise<any>;
  bulkUpdate: (items: BulkUpdateItem[]) => Promise<any>;
  cloneItems: (sourceLocationId: string, targetLocationId: string, items?: number[]) => Promise<any>;
  addProductTag: (data: AddProductTagData) => Promise<any>;
  removeProductTag: (restaurantProductId: string | number, tagId: string | number) => Promise<any>;
  getTagsByName: (tagNames: string[]) => Promise<ProductTag[]>;
  createMultipleRestaurantProductModifiers: (modifiers: RestaurantProductModifier[]) => Promise<any>;
}
