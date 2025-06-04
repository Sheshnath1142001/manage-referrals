import { useState, useEffect } from "react";
import { categoriesApi } from "@/services/api";

// Default categories as fallback
const defaultCategories = [
  { id: 1, name: "Pizza" },
  { id: 2, name: "Burger" },
  { id: 3, name: "Drinks" },
  { id: 4, name: "MISC" },
  { id: 5, name: "Fish" },
  { id: 6, name: "Sides" },
  { id: 7, name: "Desserts" }
];

export interface CategoryOption {
  id: number;
  name: string;
}

export function useItemsCategories() {
  const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Fetch all categories with pagination parameters
      const response = await categoriesApi.getCategories({ 
        page: 1,
        per_page: 99999
      });
      
      console.log("Categories API response:", response);
      
      let categoriesList = [];
      
      // Handle different response formats
      if (response && response.data && Array.isArray(response.data)) {
        categoriesList = response.data;
      } else if (response && Array.isArray(response)) {
        categoriesList = response;
      } else if (response && response.data && response.data.categories && Array.isArray(response.data.categories)) {
        categoriesList = response.data.categories;
      }
      
      if (categoriesList.length > 0) {
        const formattedCategories = categoriesList.map(cat => ({
          id: cat.id,
          name: cat.category || cat.name || "Unknown"
        }));
        
        console.log("Formatted categories:", formattedCategories);
        
        if (formattedCategories.length > 0) {
          setAvailableCategories(formattedCategories);
        } else {
          console.warn("No categories returned from API, using defaults");
          setAvailableCategories(defaultCategories);
        }
      } else {
        console.warn("No categories found, using defaults");
        setAvailableCategories(defaultCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAvailableCategories(defaultCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    availableCategories,
    isLoading,
    fetchCategories
  };
}
