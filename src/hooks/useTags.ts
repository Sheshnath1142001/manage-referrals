
import { useState, useEffect, useCallback } from 'react';
import { Tag } from '@/lib/types';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use dummy data instead of API call
      const dummyTags: Tag[] = [
        { id: "1", name: "Vegetarian", description: "Vegetarian options", foodTruckCount: 15 },
        { id: "2", name: "Vegan", description: "Vegan options", foodTruckCount: 8 },
        { id: "3", name: "Gluten Free", description: "Gluten-free options", foodTruckCount: 12 },
        { id: "4", name: "Organic", description: "Organic ingredients", foodTruckCount: 10 },
        { id: "5", name: "Fast Service", description: "Quick service", foodTruckCount: 20 },
        { id: "6", name: "Family Friendly", description: "Kid-friendly options", foodTruckCount: 18 },
        { id: "7", name: "Spicy", description: "Spicy food options", foodTruckCount: 14 },
        { id: "8", name: "Dessert", description: "Sweet treats", foodTruckCount: 9 },
        { id: "9", name: "Drinks", description: "Beverage options", foodTruckCount: 11 },
        { id: "10", name: "Seafood", description: "Fresh seafood", foodTruckCount: 7 }
      ];
      
      setTags(dummyTags.slice(0, limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const refreshTags = useCallback((limit?: number) => {
    fetchTags(limit);
  }, [fetchTags]);

  return {
    tags,
    error,
    loading,
    refreshTags
  };
};
