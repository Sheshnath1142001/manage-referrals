import { api } from '../client';

// Tags related operations
const getTags = (params?: any) => api.get('/tags', { params });

const createTag = (data: any) => api.post('/tags', data);

const updateTag = (id: string, data: any) => api.put(`/tags/${id}`, data);

const deleteTag = (id: string) => api.delete(`/tags/${id}`);

export const tagsService = {
  getTags,
  createTag,
  updateTag,
  deleteTag
}; 