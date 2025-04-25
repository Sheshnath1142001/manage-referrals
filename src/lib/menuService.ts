import { dummyData, simulateApiCall } from './dummyData';
import { MenuItem } from './types';

export const getMenuItems = async (foodTruckId: string): Promise<{ items: MenuItem[]; total: number }> => {
  const items = dummyData.menuItems.filter(item => item.foodTruckId === foodTruckId);
  return simulateApiCall({
    items,
    total: items.length
  });
};

// Get a single menu item by ID
export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  const menuItem = dummyData.menuItems.find(item => item.id === id);
  return simulateApiCall(menuItem);
};

// Create a new menu item
export const createMenuItem = async (foodTruckId: string, menuItemData: MenuItem): Promise<MenuItem> => {
  // Simulate creating a new menu item
  const newItem = { ...menuItemData, id: Math.random().toString(36).substring(7) };
  dummyData.menuItems.push(newItem);
  return simulateApiCall(newItem);
};

// Update a menu item
export const updateMenuItem = async (id: string, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
  // Simulate updating a menu item
  const index = dummyData.menuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    dummyData.menuItems[index] = { ...dummyData.menuItems[index], ...menuItemData };
    return simulateApiCall(dummyData.menuItems[index]);
  }
  return simulateApiCall(null);
};

// Delete a menu item
export const deleteMenuItem = async (id: string): Promise<void> => {
  // Simulate deleting a menu item
  const index = dummyData.menuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    dummyData.menuItems.splice(index, 1);
  }
  return simulateApiCall(null);
};

// Upload menu item image
export const uploadMenuItemImage = async (id: string, file: File): Promise<{ url: string }> => {
  // Simulate uploading an image
  const imageUrl = URL.createObjectURL(file);
  return simulateApiCall({ url: imageUrl });
};

// Get menu categories
export const getMenuCategories = async (foodTruckId: string): Promise<string[]> => {
  // Simulate getting menu categories
  const categories = [...new Set(dummyData.menuItems.filter(item => item.foodTruckId === foodTruckId).map(item => item.category))];
  return simulateApiCall(categories);
};
