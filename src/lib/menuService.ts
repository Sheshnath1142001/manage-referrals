import api from './api';
import { MenuItem } from './foodTruckService';

export interface MenuItemListResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get menu items for a food truck
export const getMenuItems = async (foodTruckId: string, params: { page?: number; limit?: number; category?: string } = {}): Promise<MenuItemListResponse> => {
  const response = await api.get<MenuItemListResponse>(`/menu/food-truck/${foodTruckId}`, { params });
  return response.data;
};

// Get a single menu item by ID
export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  const response = await api.get<MenuItem>(`/menu/${id}`);
  return response.data;
};

// Create a new menu item
export const createMenuItem = async (foodTruckId: string, menuItemData: MenuItem): Promise<MenuItem> => {
  const response = await api.post<MenuItem>(`/menu/food-truck/${foodTruckId}`, menuItemData);
  return response.data;
};

// Update a menu item
export const updateMenuItem = async (id: string, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await api.put<MenuItem>(`/menu/${id}`, menuItemData);
  return response.data;
};

// Delete a menu item
export const deleteMenuItem = async (id: string): Promise<void> => {
  await api.delete(`/menu/${id}`);
};

// Upload menu item image
export const uploadMenuItemImage = async (id: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<{ url: string }>(`/menu/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Get menu categories
export const getMenuCategories = async (foodTruckId: string): Promise<string[]> => {
  const response = await api.get<string[]>(`/menu/food-truck/${foodTruckId}/categories`);
  return response.data;
};