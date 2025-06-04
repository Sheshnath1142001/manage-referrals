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

// Get categories with optional filtering
export const getCategories = (params?: {
  page?: number;
  per_page?: number;
  status?: number; // Make sure status is explicitly typed as number
  category_name?: string;
  seq_no?: string;
}) => {
  console.log("Calling categories API with params:", params);
  return api.get('/categories', { params }); // Update the endpoint to match what your backend expects
};

// Get a specific category by ID
export const getCategory = (id: string | number) => {
  return api.get(`/categories/${id}`);
};

// Create a new category
export const createCategory = (data: FormData) => {
  return api.post('/category', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Update an existing category
export const updateCategory = (id: string | number, data: any) => {
  // Convert FormData to plain object for PATCH request
  let requestData = data;
  if (data instanceof FormData) {
    const plainData: Record<string, any> = {};
    data.forEach((value, key) => {
      // Don't include the ID in the request body
      if (key !== 'id') {
        plainData[key] = value;
      }
    });
    requestData = plainData;
  }
  
  console.log('Updating category with data:', requestData);
  return api.patch(`/category/${id}`, requestData);
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
  return api.post('/categories/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const categoriesApi = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategorySequence,
  importCategory
};
