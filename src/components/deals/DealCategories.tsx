import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import { DealCategory, dealsApi } from "@/services/api/deals";
import { useEffect, useState } from "react";

interface DealCategoriesProps {
  dealId: number;
  restaurantId: number;
  initialCategories?: DealCategory[];
  onCategoriesChange: (categories: DealCategory[]) => void;
  disabled?: boolean;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const DealCategories = ({
  dealId,
  restaurantId,
  initialCategories = [],
  onCategoriesChange,
  disabled = false,
}: DealCategoriesProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<DealCategory[]>(initialCategories);
  const [availableCategories, setAvailableCategories] = useState<DealCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
    }
  }, [restaurantId]);

  // Keep local selection in sync with parent when switching between create/edit dialogs
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/v2/deals/categories/list?restaurant_id=${restaurantId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('Admin') ? `Bearer ${JSON.parse(localStorage.getItem('Admin')).token}` : '',
          },
        }
      );
      const data = await response.json();
      
      // Ensure data.data is an array and map it safely
      const categoriesData = Array.isArray(data.data) ? data.data : [];
      const mappedCategories = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name
      }));
      
      setAvailableCategories(mappedCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
      setAvailableCategories([]); // Set empty array on error
    }
  };

  const handleCategoriesChange = async (selectedCategoryIds: string[]) => {
    // Don't make an API call here, just update the local state
    const selectedCategories = availableCategories.filter(category => 
      selectedCategoryIds.includes(category.id.toString())
    );

    setCategories(selectedCategories);
    onCategoriesChange(selectedCategories);
  };

  // Ensure categoryOptions is always an array with the correct format
  const categoryOptions = availableCategories.map(category => ({
    value: category.id.toString(),
    label: category.name
  }));

  // Ensure selectedCategoryIds is always an array
  const selectedCategoryIds = categories.map(category => category.id.toString());

  return (
    <div className="space-y-2">
      <Label>Deal Categories</Label>
      <MultiSelect
        options={categoryOptions}
        value={selectedCategoryIds}
        onChange={handleCategoriesChange}
        placeholder="Select categories"
        disabled={disabled || isLoading}
        searchable={true}
        loading={isLoading}
      />
    </div>
  );
}; 