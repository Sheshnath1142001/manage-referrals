
import { useState } from 'react';
import { modifierCategoriesApi } from '@/services/api/modifiers';
import { toast } from '@/hooks/use-toast';
import { ModifierCategory } from '@/types/modifiers';

export const useModifierCategoryForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ModifierCategory | undefined>(undefined);
  const [isModifierCategoryLoading, setIsModifierCategoryLoading] = useState(false);
  
  const openAddDialog = () => {
    setEditingCategory(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: ModifierCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (category: ModifierCategory) => {
    setIsModifierCategoryLoading(true);
    
    try {
      const categoryData = {
        modifier_category: category.name,
        is_mandatory: category.isMandatory ? 1 : 0,
        is_single_select: category.isSingleSelect ? 1 : 0,
        status: category.status === "Active" ? 1 : 0,
        max: category.max,
        min: category.min || null
      };
      
      if (editingCategory?.id) {
        // Update existing category
        await modifierCategoriesApi.updateModifierCategory(editingCategory.id, categoryData);
        toast({
          title: "Category Updated",
          description: `${category.name} has been updated successfully.`
        });
      } else {
        // Create new category
        await modifierCategoriesApi.createModifierCategory(categoryData);
        toast({
          title: "Category Added",
          description: `${category.name} has been added successfully.`
        });
      }
      
      // Close dialog after successful submission
      closeDialog();
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to save category.",
        variant: "destructive"
      });
    } finally {
      setIsModifierCategoryLoading(false);
    }
  };

  return {
    isDialogOpen,
    editingCategory,
    isSubmitting: isModifierCategoryLoading,
    openAddDialog,
    openEditDialog,
    closeDialog,
    handleSubmit
  };
};
