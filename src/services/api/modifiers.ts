import { api, PaginatedResponse } from './client';
import { CreateModifierPayload, UpdateModifierPayload } from '@/types/modifiers';

// Response interfaces
export interface ModifierResponse {
  id: string | number;
  name?: string;
  modifier?: string;
  seq_no: number;
  category?: string;
  modifier_category_id?: number;
  modifier_categories?: {
    id: number;
    modifier_category: string;
    seq_no: number;
    is_mandatory: number;
    is_single_select: number;
    status: number;
    min: number | null;
    max: number | null;
  };
  status: number | string;
}

export interface ModifierCategoryResponse {
  id: string;
  name: string;
  modifier_category?: string;
  seq_no: number;
  max: number | null;
  min?: number | null;
  status: 'active' | 'inactive';
  is_mandatory: boolean;
  is_single_select: boolean;
}

export interface RawModifierCategoryResponse {
  id: number | string;
  modifier_category: string;
  is_mandatory: number;
  is_single_select: number;
  min: number | null;
  max: number | null;
  seq_no: number;
  status: number;
  restaurant_id?: number;
  is_portion_allowed?: number;
}

export interface ModifierCategoriesApiResponse {
  modifier_categories: RawModifierCategoryResponse[];
  total: number;
}

export interface RestaurantProductModifierResponse {
  id: string;
  restaurant_product_id: string;
  modifier_id: string;
  modifier: {
    id: string;
    name: string;
  };
  price: number;
  seq_no: number;
  status: 'active' | 'inactive';
}

export interface ModifierData {
  name: string;
  category: string;
  status: number;
}

export interface ModifierCategoryData {
  modifier_category: string;
  is_mandatory: number;
  is_single_select: number;
  min?: number | null;
  max?: number | null;
  seq_no?: number;
  status?: number;
}

export const modifiersApi = {
  getModifiers: async (params: any): Promise<any> => {
    
    
    const apiParams = { ...params };
    
    if (apiParams.status === 'Active') {
      apiParams.status = 1;
    } else if (apiParams.status === 'Inactive') {
      apiParams.status = 0;
    }
    
    if (apiParams.page !== undefined) {
      apiParams.page = Number(apiParams.page);
    }
    
    if (apiParams.per_page !== undefined) {
      apiParams.per_page = Number(apiParams.per_page);
    }
    
    const response = await api.get('/modifiers', { params: apiParams });
    
    return response;
  },
  
  createModifier: (data: ModifierData | CreateModifierPayload) => {
    
    
    if ('modifier' in data && 'modifier_category_id' in data) {
      return api.post('/modifier', data);
    } else {
      const formData = new FormData();
      const oldData = data as ModifierData;
      formData.append('name', oldData.name);
      formData.append('category', oldData.category);
      formData.append('status', oldData.status.toString());
      return api.post('/modifiers', formData);
    }
  },
  
  updateModifier: (id: string, data: ModifierData | UpdateModifierPayload) => {
    
    
    if ('modifier' in data || 'modifier_category_id' in data) {
      return api.patch(`/modifier/${id}`, data);
    } else {
      const formData = new FormData();
      const oldData = data as ModifierData;
      formData.append('name', oldData.name);
      formData.append('category', oldData.category);
      formData.append('status', oldData.status.toString());
      return api.put(`/modifiers/${id}`, formData);
    }
  },
  
  updateModifierSequence: (id: number, newSeqNo: number, modifierCategoryId: number) => {
    
    return api.patch('/shift-modifier-seq', {
      id,
      new_seq_no: newSeqNo,
      modifier_category_id: modifierCategoryId
    });
  },
  
  updateModifierSeqNo: (id: string, seqNo: number, modifierCategoryId: number) => {
    
    return api.patch('/shift-modifier-seq', {
      id: Number(id),
      new_seq_no: seqNo,
      modifier_category_id: modifierCategoryId
    });
  },
  
  deleteModifier: (id: string) => api.delete(`/modifiers/${id}`),
  
  importModifiers: (data: FormData) => {
    
    return api.post('/modifiers/import', data);
  },
  
  getRestaurantProductModifiers: async (params: any): Promise<PaginatedResponse<RestaurantProductModifierResponse>> => {
    const response = await api.get('/restaurant-product-modifiers', { params });
    return response as unknown as PaginatedResponse<RestaurantProductModifierResponse>;
  },
  
  addRestaurantProductModifier: (data: FormData) => api.post('/restaurant-product-modifiers', data),
  
  updateRestaurantProductModifier: (id: string, data: FormData) => {
    return api.put(`/restaurant-product-modifiers/${id}`, data);
  },
  
  addMultipleRestaurantProductModifiers: (data: any) => api.post('/restaurant-product-modifiers/multiple', data),
};

export const modifierCategoriesApi = {
  getModifierCategories: async (params: any): Promise<ModifierCategoriesApiResponse> => {
    const apiParams = { ...params };
    
    // Status conversion
    if (apiParams.status === 'Active') {
      apiParams.status = 1;
    } else if (apiParams.status === 'Inactive') {
      apiParams.status = 0;
    }
    
    // Convert pagination params to numbers
    if (apiParams.page !== undefined) {
      apiParams.page = Number(apiParams.page);
    }
    
    if (apiParams.per_page !== undefined) {
      apiParams.per_page = Number(apiParams.per_page);
    }
    
    // Convert sequence number to number if present
    if (apiParams.seq_no !== undefined && apiParams.seq_no !== '') {
      apiParams.seq_no = Number(apiParams.seq_no);
    } else {
      delete apiParams.seq_no;
    }
    
    // Remove empty filter values
    if (!apiParams.modifier_category) {
      delete apiParams.modifier_category;
    }
    
    // Log the final parameters being sent to the API
    
    
    const response = await api.get('/modifier-categories', { params: apiParams });
    
    
    return response as unknown as ModifierCategoriesApiResponse;
  },
  
  createModifierCategory: async (data: ModifierCategoryData) => {
    
    const response = await api.post('/modifier-category', data);
    
    return response;
  },
  
  updateModifierCategory: async (id: string, data: ModifierCategoryData) => {
    
    const response = await api.patch(`/modifier-category/${id}`, data);
    
    return response;
  },
  
  updateModifierCategorySequence: (id: string | number, seqNo: number, name: string) => {
    
    return api.patch('/shift-modifier-category-seq', {
      id: Number(id),
      name: name,
      new_seq_no: seqNo
    });
  },
  
  deleteModifierCategory: (id: string) => api.delete(`/modifier-categories/${id}`),
  
  importModifierCategories: (data: any) => {
    
    return api.post('/import-modifier-categories', data); 
  },
};
