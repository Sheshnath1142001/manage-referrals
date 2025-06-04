import { api, PaginatedResponse } from './client';

// Interfaces
export interface Deal {
  id: number;
  name: string;
  description?: string;
  deal_type_id: number;
  deal_types: {
    id: number;
    name: string;
    description: string;
  };
  start_date: string;
  end_date: string;
  active_days?: string;
  start_time?: string;
  end_time?: string;
  status: number;
  restaurant_id: number;
  fixed_price?: string | null;
  combo_product_id?: number | null;
  created_at?: string;
  updated_at?: string;
  combo_products?: any;
  deal_rules?: DealRule[];
  deal_products?: DealProduct[];
  categories?: DealCategory[];
  images?: DealImage[];
  tags?: DealTag[];
}

export interface DealType {
  id: number;
  name: string;
  slug: string;
}

export interface DealCategory {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
}

export interface DealComponentType {
  id: number;
  name: string;
}

export interface DealTag {
  id: number;
  name: string;
}

export interface DealImage {
  id: number;
  url: string;
  module_type: string;
  module_id: number;
}

export interface DealRule {
  id: number;
  deal_id: number;
  rule_type_id: number;
  rule_type: {
    id: number;
    name: string;
  };
  value: string;
}

export interface DealProduct {
  id: number;
  deal_id: number;
  product_id: number;
  deal_component_type_id: number;
  deal_component_types: {
    id: number;
    name: string;
  };
  quantity_min: number;
  quantity_max: number;
}

// API functions
export const dealsApi = {
  // Fetch deals with filters
  getDeals: async (params: {
    offset?: number;
    limit?: number;
    restaurant_id: number;
    active_only?: boolean;
    current_only?: boolean;
    deal_type_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    // Add all parameters
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.restaurant_id !== undefined) queryParams.append('restaurant_id', params.restaurant_id.toString());
    if (params.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());
    if (params.current_only !== undefined) queryParams.append('current_only', params.current_only.toString());
    if (params.deal_type_id !== undefined) queryParams.append('deal_type_id', params.deal_type_id.toString());
    
    const response = await api.get<PaginatedResponse<Deal>>(`/v2/deals?${queryParams.toString()}`);
    return response;
  },
  
  // Get deal categories
  getDealCategories: async (restaurant_id: number) => {
    const response = await api.get<{ success: boolean; data: DealCategory[] }>(`/v2/deals/categories/list?restaurant_id=${restaurant_id}`);
    return response;
  },
  
  // Create deal category
  createDealCategory: async (data: { name: string; restaurant_id: number }) => {
    const response = await api.post<DealCategory>('/v2/deals/categories', data);
    return response;
  },
  
  // Get deal component types
  getDealComponentTypes: async () => {
    console.log('Fetching deal component types...');
    const response = await api.get<DealComponentType[]>('/v2/deals/component-types/list');
    console.log('Deal component types response:', response);
    return response;
  },
  
  // Get deal types
  getDealTypes: async () => {
    const response = await api.get<DealType[]>('/v2/deals/types/list');
    return response;
  },
  
  // Get deal rule types
  getDealRuleTypes: async () => {
    const response = await api.get<{ id: number; name: string }[]>('/v2/deals/rule-types/list');
    return response;
  },
  
  // Get tags
  getTags: async (params?: { search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    const response = await api.get<DealTag[]>(`/v2/tags?${queryParams.toString()}`);
    return response;
  },
  
  // Create tag
  createTag: async (data: { name: string }) => {
    const response = await api.post<DealTag>('/v2/tags', data);
    return response;
  },
  
  // Create a new deal
  createDeal: async (dealData: Partial<Deal>) => {
    const response = await api.post<Deal>('/v2/deals', dealData);
    return response;
  },
  
  // Update an existing deal
  updateDeal: async (id: number, dealData: Partial<Deal>) => {
    const response = await api.put<Deal>(`/v2/deals/${id}`, dealData);
    return response;
  },
  
  // Delete a deal
  deleteDeal: async (id: number) => {
    const response = await api.delete(`/v2/deals/${id}`);
    return response;
  },
  
  // Get a single deal by ID
  getDealById: async (id: number) => {
    const response = await api.get<Deal>(`/v2/deals/${id}`);
    return response;
  },

  // Upload deal image
  uploadDealImage: async (formData: FormData) => {
    const response = await api.post<{ url: string }>('/v2/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Delete deal image
  deleteDealImage: async (dealId: number) => {
    const response = await api.delete(`/v2/attachments/deal/${dealId}`);
    return response;
  },

  // Add deal rule
  addDealRule: async (dealId: number, data: { rule_type_id: number; value: string }) => {
    const response = await api.post<DealRule>(`/v2/deals/${dealId}/rules`, data);
    return response;
  },

  // Update deal rule
  updateDealRule: async (dealId: number, ruleId: number, data: { value: string }) => {
    const response = await api.put<DealRule>(`/v2/deals/${dealId}/rules/${ruleId}`, data);
    return response;
  },

  // Delete deal rule
  deleteDealRule: async (dealId: number, ruleId: number) => {
    const response = await api.delete(`/v2/deals/${dealId}/rules/${ruleId}`);
    return response;
  },

  // Add deal product
  addDealProduct: async (dealId: number, data: {
    product_id: number;
    deal_component_type_id: number;
    quantity_min: number;
    quantity_max: number;
  }) => {
    const response = await api.post<DealProduct>(`/v2/deals/${dealId}/products`, data);
    return response;
  },

  // Update deal product
  updateDealProduct: async (dealId: number, productId: number, data: {
    deal_component_type_id: number;
    quantity_min: number;
    quantity_max: number;
  }) => {
    const response = await api.put<DealProduct>(`/v2/deals/${dealId}/products/${productId}`, data);
    return response;
  },

  // Delete deal product
  deleteDealProduct: async (dealId: number, productId: number) => {
    const response = await api.delete(`/v2/deals/${dealId}/products/${productId}`);
    return response;
  },

  getCategories: async (params: any) => {
    return api.get('/categories', { params });
  },

  // Update deal categories
  updateDealCategories: async (dealId: number, categoryIds: number[]) => {
    const response = await api.put<DealCategory[]>(`/v2/deals/${dealId}/categories`, {
      category_ids: categoryIds
    });
    return response;
  }
}; 