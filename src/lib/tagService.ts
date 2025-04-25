import api from './api';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  foodTruckCount?: number;
}

interface TagResponse {
  items: Tag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get all tags
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get<TagResponse>('/tags');
    return response.data.items;
  } catch (error: any) {
    console.error('Error fetching all tags:', error.response?.data || error.message);
    return [];
  }
};

// Get popular tags
export const getPopularTags = async (limit: number = 10): Promise<Tag[]> => {
  try {
    const response = await api.get<TagResponse>('/tags/popular', {
      params: { limit }
    });
    return response.data.items;
  } catch (error: any) {
    console.error('Error fetching popular tags:', error.response?.data || error.message);
    return [];
  }
};

// Get a single tag by ID
export const getTagById = async (id: string): Promise<Tag | null> => {
  try {
    const response = await api.get<Tag>(`/tags/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Tag with ID ${id} not found:`, error.response?.data?.message || 'Tag not found');
      return null;
    }
    console.error('Error fetching tag by ID:', error.response?.data || error.message);
    throw error;
  }
};

// Get a single tag by slug
export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  try {
    const response = await api.get<Tag>(`/tags/slug/${slug}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Tag with slug ${slug} not found:`, error.response?.data?.message || 'Tag not found');
      return null;
    }
    console.error('Error fetching tag by slug:', error.response?.data || error.message);
    throw error;
  }
};

// Create a new tag (admin only)
export const createTag = async (tagData: { name: string; description?: string }): Promise<Tag> => {
  try {
    const response = await api.post<Tag>('/tags', tagData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating tag:', error.response?.data || error.message);
    throw error;
  }
};

// Update a tag (admin only)
export const updateTag = async (id: string, tagData: { name?: string; description?: string }): Promise<Tag> => {
  try {
    const response = await api.put<Tag>(`/tags/${id}`, tagData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating tag:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a tag (admin only)
export const deleteTag = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tags/${id}`);
  } catch (error: any) {
    console.error('Error deleting tag:', error.response?.data || error.message);
    throw error;
  }
};