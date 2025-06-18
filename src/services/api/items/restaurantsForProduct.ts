
import { api } from '../client';

export interface RestaurantForProduct {
  restaurants: {
    id: number;
    name: string;
    type: string | null;
    status: number;
    owner_id: string;
    created_by: string;
    created_at: string;
  };
}

export const getRestaurantsForProduct = async (productId: number | string): Promise<RestaurantForProduct[]> => {
  try {
    const response = await api.get('/restaurants-for-product', {
      params: { product_id: productId }
    });
    return response.data || response || [];
  } catch (error) {
    
    return [];
  }
};
