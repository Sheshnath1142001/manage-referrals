import axios from 'axios';
import { api } from './client';

export interface Category {
  id: string | number;
  category: string;
  seq_no: number;
  status: number;
  image?: string;
}

export interface CategoryResponse {
  data: Category[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  categories?: Category[];
}

export interface Attachment {
  id: string;
  attachment_type: number;
  module_type: number;
  module_id: string;
  original_file_name: string;
  extension: string;
  upload_path: string;
  mime_type: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_by: string | null;
  deleted_at: string | null;
  storage_type: number;
  is_featured: number;
}

export interface AttachmentResponse {
  attachment: Attachment[];
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

// Get categories with optional filtering
export const getCategories = (params?: {
  page?: number;
  per_page?: number;
  status?: number;
  category_name?: string;
  seq_no?: string;
}) => {
  
  return api.get('/categories', { params });
};

// Get a specific category by ID
export const getCategory = (id: string | number) => {
  return api.get(`/categories/${id}`);
};

// Get category attachments
export const getCategoryAttachments = (moduleId: string | number) => {
  return api.get<AttachmentResponse>('/attachments', {
    params: {
      module_type: 1, // Category module type
      module_id: moduleId
    }
  });
};

// Create a new category
export const createCategory = (data: FormData) => {
  return api.post(`/category`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update an existing category
export const updateCategory = (id: string | number, data: { category: string; status: string }) => {
  
  return api.patch(`/category/${id}`, data);
};

// Delete a category
export const deleteCategory = (id: string | number) => {
  return api.delete(`/categories/${id}`);
};

// Update category sequence
export const updateCategorySequence = (id: string | number, newSeqNo: number, name: string) => {
  return api.patch('/shift-category-seq', {
    id: Number(id),
    name: name,
    new_seq_no: newSeqNo
  });
};

// Import categories from CSV
export const importCategory = (formData: FormData) => {
  // ✅ FIXED: Don't set Content-Type header - let the browser set it with boundary
  return api.post('/categories/import', formData);
};

// Delete category attachment
export const deleteCategoryAttachment = (attachmentId: number, categoryId: number, moduleId: number) => {
  return api.patch(`/attachment/status/${attachmentId}/${categoryId}/${moduleId}`);
};

export const categoriesApi = {
  getCategories,
  getCategory,
  getCategoryAttachments,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategorySequence,
  importCategory,
  deleteCategoryAttachment
};