
import { create } from 'zustand';

export interface Restaurant {
  id: string;
  name: string;
  // Add other restaurant properties as needed
}

interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  selectedRestaurant: null,
  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedRestaurant: (selectedRestaurant) => set({ selectedRestaurant }),
}));
