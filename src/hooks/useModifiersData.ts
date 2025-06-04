
import { useState, useEffect, useCallback } from 'react';
import { modifiersApi } from '@/services/api/modifiers';
import { toast } from '@/hooks/use-toast';
import { Modifier } from '@/types/modifiers';

export const useModifiersData = () => {
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [modifierCategories, setModifierCategories] = useState<string[]>([]);

  const fetchModifiers = useCallback(async (currentPage: number, pageSize: number, categoryFilter: string, statusFilter: "Active" | "Inactive" | "all", nameFilter: string, seqNoFilter: string) => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: pageSize,
        category: categoryFilter || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        name: nameFilter || undefined,
        seq_no: seqNoFilter || undefined
      };

      console.log("Fetching modifiers with params:", params);
      const response = await modifiersApi.getModifiers(params);
      console.log("API response:", response);
      
      if (!response.modifiers) {
        console.error("API response doesn't contain modifiers array:", response);
        setModifiers([]);
        setTotalItems(0);
        return;
      }
      
      const formattedModifiers = response.modifiers.map((item: any) => {
        let modifierStatus: "Active" | "Inactive";
        
        if (typeof item.status === 'number') {
          modifierStatus = item.status === 1 ? "Active" : "Inactive";
        } else if (typeof item.status === 'string') {
          modifierStatus = item.status === "1" || item.status.toLowerCase() === "active" 
            ? "Active" 
            : "Inactive";
        } else {
          modifierStatus = "Inactive";
        }
        
        return {
          id: String(item.id),
          name: item.modifier || item.name || "",
          seqNo: item.seq_no || 0,
          category: item.modifier_categories?.modifier_category || item.category || "",
          categoryId: item.modifier_categories?.id || item.modifier_category_id || null,
          status: modifierStatus
        };
      });
      
      setModifiers(formattedModifiers);
      setTotalItems(response.total || formattedModifiers.length);
      
      const validCategories = formattedModifiers
        .map(m => m.category)
        .filter((category): category is string => 
          typeof category === 'string' && category.trim() !== ''
        );
      
      const uniqueCategoriesSet = new Set<string>(validCategories);
      const uniqueCategories = Array.from(uniqueCategoriesSet);
      setModifierCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching modifiers:", error);
      
      const errorStatus = (error as any)?.response?.status;
      if (errorStatus !== 401) {
        toast({
          title: "Failed to fetch modifiers",
          description: "Could not retrieve modifiers. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDragEnd = async (result: any, items: Modifier[]) => {
    if (!result.destination) return false;

    const reorderedItems = [...items];
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    const newSeqNo = result.destination.index + 1;

    try {
      // Get the modifier category ID from the reordered item
      const categoryId = reorderedItem.categoryId ? 
        (typeof reorderedItem.categoryId === 'string' ? 
          parseInt(reorderedItem.categoryId as string, 10) : reorderedItem.categoryId) : 
        null;
      
      if (!categoryId) {
        throw new Error('Missing category ID for the modifier');
      }

      // Call the API with the correct category ID
      await modifiersApi.updateModifierSeqNo(
        reorderedItem.id,
        newSeqNo,
        categoryId as number
      );

      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        seqNo: index + 1
      }));

      setModifiers(updatedItems);

      toast({
        title: "Sequence Updated",
        description: "Modifier sequence has been updated successfully."
      });

      return true;
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update modifier sequence.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    modifiers,
    isLoading,
    totalItems,
    modifierCategories,
    fetchModifiers,
    handleDragEnd,
    setModifiers
  };
};
