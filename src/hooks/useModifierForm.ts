
import { useState } from 'react';
import { modifiersApi } from '@/services/api/modifiers';
import { toast } from '@/hooks/use-toast';
import { Modifier } from '@/types/modifiers';

export const useModifierForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<Modifier | undefined>(undefined);
  const [isModifierLoading, setIsModifierLoading] = useState(false);
  
  const openAddDialog = () => {
    setEditingModifier(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (modifier: Modifier) => {
    setIsModifierLoading(true);
    
    try {
      const modifierData = {
        name: modifier.name,
        category: modifier.category,
        status: modifier.status === "Active" ? 1 : 0
      };
      
      if (editingModifier?.id) {
        // Update existing modifier
        await modifiersApi.updateModifier(editingModifier.id, modifierData);
        toast({
          title: "Modifier Updated",
          description: `${modifier.name} has been updated successfully.`
        });
      } else {
        // Create new modifier
        await modifiersApi.createModifier(modifierData);
        toast({
          title: "Modifier Added",
          description: `${modifier.name} has been added successfully.`
        });
      }
      
      // Close dialog after successful submission
      closeDialog();
    } catch (error) {
      console.error("Error saving modifier:", error);
      toast({
        title: "Error",
        description: "Failed to save modifier.",
        variant: "destructive"
      });
    } finally {
      setIsModifierLoading(false);
    }
  };

  return {
    isDialogOpen,
    editingModifier,
    isSubmitting: isModifierLoading,
    openAddDialog,
    openEditDialog,
    closeDialog,
    handleSubmit
  };
};
