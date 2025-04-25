import { dummyData, simulateApiCall } from './dummyData';
import { MenuItem } from './types';

export const getMenuItems = async (foodTruckId: string): Promise<{ items: MenuItem[]; total: number }> => {
  const dummyMenuItems: MenuItem[] = [
    {
      id: "item1",
      name: "Classic Taco",
      description: "A delicious traditional taco",
      price: 8.99,
      image: "/placeholder.svg",
      category: "Tacos",
      isAvailable: true,
      foodTruckId
    }
  ];
  
  return simulateApiCall({
    items: dummyMenuItems,
    total: dummyMenuItems.length
  });
};

export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  // Find in our dummy menu items
  const dummyMenuItems = [
    {
      id: "item1",
      name: "Classic Taco",
      description: "A delicious traditional taco with your choice of protein",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      category: "Tacos",
      isAvailable: true,
      foodTruckId: "truck1",
      isVegetarian: false,
      isPopular: true
    },
    {
      id: "item2",
      name: "Veggie Burrito",
      description: "Fresh vegetables wrapped in a warm tortilla",
      price: 10.99,
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      category: "Burritos",
      isAvailable: true,
      foodTruckId: "truck1",
      isVegetarian: true,
      isVegan: true
    }
  ];
  
  const menuItem = dummyMenuItems.find(item => item.id === id);
  return simulateApiCall(menuItem as MenuItem);
};

export const createMenuItem = async (foodTruckId: string, menuItemData: MenuItem): Promise<MenuItem> => {
  // Simulate creating a new menu item
  const newItem = { ...menuItemData, id: Math.random().toString(36).substring(7) };
  dummyData.menuItems.push(newItem);
  return simulateApiCall(newItem);
};

export const updateMenuItem = async (id: string, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
  // Simulate updating a menu item
  const index = dummyData.menuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    dummyData.menuItems[index] = { ...dummyData.menuItems[index], ...menuItemData };
    return simulateApiCall(dummyData.menuItems[index]);
  }
  return simulateApiCall(null);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  // Simulate deleting a menu item
  const index = dummyData.menuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    dummyData.menuItems.splice(index, 1);
  }
  return simulateApiCall(null);
};

export const uploadMenuItemImage = async (id: string, file: File): Promise<{ url: string }> => {
  // Simulate uploading an image
  const imageUrl = URL.createObjectURL(file);
  return simulateApiCall({ url: imageUrl });
};

export const getMenuCategories = async (foodTruckId: string): Promise<string[]> => {
  // Dummy categories
  const categories = ["Tacos", "Burritos", "Quesadillas", "Drinks", "Sides"];
  return simulateApiCall(categories);
};
