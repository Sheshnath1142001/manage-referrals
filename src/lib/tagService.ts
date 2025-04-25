import { dummyData, simulateApiCall } from './dummyData';
import { Tag } from './types';

export const getAllTags = async (): Promise<Tag[]> => {
  return simulateApiCall(dummyData.tags);
};

export const getPopularTags = async (limit: number = 10): Promise<Tag[]> => {
  return simulateApiCall(dummyData.tags.slice(0, limit));
};

// Get a single tag by ID
export const getTagById = async (id: string): Promise<Tag | null> => {
  const tag = dummyData.tags.find(tag => tag.id === id) || null;
  return simulateApiCall(tag);
};

// Get a single tag by slug
export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  const tag = dummyData.tags.find(tag => tag.name === slug) || null;
  return simulateApiCall(tag);
};

// Create a new tag (admin only)
export const createTag = async (tagData: { name: string; description?: string }): Promise<Tag> => {
  const newTag: Tag = {
    id: Math.random().toString(36).substring(2, 15),
    name: tagData.name,
    description: tagData.description,
  };
  dummyData.tags.push(newTag);
  return simulateApiCall(newTag);
};

// Update a tag (admin only)
export const updateTag = async (id: string, tagData: { name?: string; description?: string }): Promise<Tag> => {
  const tagIndex = dummyData.tags.findIndex(tag => tag.id === id);
  if (tagIndex !== -1) {
    dummyData.tags[tagIndex] = { ...dummyData.tags[tagIndex], ...tagData };
    return simulateApiCall(dummyData.tags[tagIndex]);
  }
  return simulateApiCall({} as Tag);
};

// Delete a tag (admin only)
export const deleteTag = async (id: string): Promise<void> => {
  const tagIndex = dummyData.tags.findIndex(tag => tag.id === id);
  if (tagIndex !== -1) {
    dummyData.tags.splice(tagIndex, 1);
  }
  return simulateApiCall(undefined);
};
