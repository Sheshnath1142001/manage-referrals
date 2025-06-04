import { useState } from "react";
import { CategoryFilters } from "@/components/categories/CategoryFilters";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategorySheet } from "@/components/categories/CategorySheet";
import { Category, CategoriesProvider } from "@/components/categories/CategoriesContext";
import { useCategories as useCategoriesHook } from "@/components/categories/useCategories";
import { toast } from "@/hooks/use-toast";

const Categories = () => {
  // Local component state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Get categories logic from our hook
  const categoriesData = useCategoriesHook();
  
  // Add dragging state
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<Category | null>(null);

  // Form handlers
  const handleViewEdit = (category: Category, viewOnly = false) => {
    setEditingCategory(category);
    setIsViewMode(viewOnly);
    setIsSheetOpen(true);
  };

  const handleFormClose = () => {
    setEditingCategory(null);
    setIsViewMode(false);
  };

  const handleAddNew = () => {
    setIsSheetOpen(true);
    setEditingCategory(null);
    setIsViewMode(false);
  };

  // Drag and drop handlers
  const handleDragStart = (category: Category) => {
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, category: Category) => {
    e.preventDefault();
    if (draggedCategory?.id !== category.id) {
      setDragOverCategory(category);
    }
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (category: Category) => {
    if (!draggedCategory || draggedCategory.id === category.id) {
      setDraggedCategory(null);
      setDragOverCategory(null);
      return;
    }

    const fromIndex = categoriesData.categories.findIndex(item => item.id === draggedCategory.id);
    const toIndex = categoriesData.categories.findIndex(item => item.id === category.id);
    
    // Get the new sequence number for the dragged item
    let newSeqNo;
    if (fromIndex < toIndex) {
      // Moving down
      newSeqNo = category.seqNo;
    } else {
      // Moving up
      newSeqNo = category.seqNo > 0 ? category.seqNo - 1 : 0;
    }

    // Update the sequence in the backend
    handleUpdateSequence(draggedCategory.id, newSeqNo, draggedCategory.name);
    
    // Reset drag state
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  const handleUpdateSequence = async (categoryId: string, newSeqNo: number, categoryName: string) => {
    try {
      // Call the sequence update function from the hook
      await categoriesData.handleUpdateSequence(categoryId, newSeqNo, categoryName);
      toast({
        title: "Category Reordered",
        description: "The new sequence has been saved successfully."
      });
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast({
        title: "Reordering Failed",
        description: "Failed to update the category sequence on the server.",
        variant: "destructive"
      });
    }
  };

  return (
    <CategoriesProvider value={{
      ...categoriesData,
      draggedCategory,
      dragOverCategory,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop
    }}>
      <div className="p-4 max-w-full">
        <CategoryFilters 
          onAddNew={handleAddNew}
          onImportCSV={categoriesData.handleImportCSV}
          onRefresh={categoriesData.refetch}
        />
        
        <CategoryList 
          onViewEdit={handleViewEdit}
          onUpdateSequence={handleUpdateSequence}
        />
        
        <CategorySheet 
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          editingCategory={editingCategory}
          isViewMode={isViewMode}
          createMutation={categoriesData.createCategoryMutation}
          updateMutation={categoriesData.updateCategoryMutation}
          onClose={handleFormClose}
        />
      </div>
    </CategoriesProvider>
  );
};

export default Categories;
