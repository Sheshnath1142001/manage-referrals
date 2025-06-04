
import { useState } from 'react';
import { useModifiersData } from './useModifiersData';
import { ModifierCategory } from '@/components/modifiers/ModifierCategoriesContext';

export const useModifierCategoryForm = (onSuccess: () => void) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ModifierCategory | null>(null);
  
  const { 
    createModifierCategoryMutation, 
    updateModifierCategoryMutation 
  } = useModifiersData();
  
  const isSubmitting = createModifierCategoryMutation.isPending || updateModifierCategoryMutation.isPending;
  
  const openCreateDialog = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (category: ModifierCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };
  
  const handleSubmit = (formData: {
    id?: string;
    name: string;
    max?: number;
    status: "active" | "inactive";
    isMandatory: boolean;
    isSingleSelect: boolean;
  }) => {
    const data = new FormData();
    
    if (editingCategory?.id) {
      data.append('id', editingCategory.id);
    }
    
    data.append('name', formData.name);
    
    if (formData.max !== undefined) {
      data.append('max', formData.max.toString());
    }
    
    data.append('status', formData.status);
    data.append('is_mandatory', formData.isMandatory ? '1' : '0');
    data.append('is_single_select', formData.isSingleSelect ? '1' : '0');
    
    if (editingCategory) {
      updateModifierCategoryMutation.mutate(data, {
        onSuccess: () => {
          closeDialog();
          onSuccess();
        }
      });
    } else {
      createModifierCategoryMutation.mutate(data, {
        onSuccess: () => {
          closeDialog();
          onSuccess();
        }
      });
    }
  };
  
  return {
    isDialogOpen,
    editingCategory,
    isSubmitting,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSubmit
  };
};
