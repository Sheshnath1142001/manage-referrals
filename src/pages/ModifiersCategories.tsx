
import { ModifierCategoriesProvider } from "@/components/modifiers/ModifierCategoriesContext";
import ModifierCategoryFilters from "@/components/modifiers/ModifierCategoryFilters";
import ModifierCategoryTable from "@/components/modifiers/ModifierCategoryTable";
import AddEditModifierCategoryDialog from "@/components/AddEditModifierCategoryDialog";
import { useModifierCategories } from "@/components/modifiers/ModifierCategoriesContext";

// This component wraps the dialog with the context
const ModifierCategoryDialog = () => {
  const { isDialogOpen, setIsDialogOpen, editingCategory, isLoading, dialogMode, handleFormSubmit } = useModifierCategories();
  
  return (
    <AddEditModifierCategoryDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSubmit={handleFormSubmit}
      initialData={editingCategory}
      isSubmitting={isLoading}
      mode={dialogMode}
    />
  );
};

// Main page content with context available
const ModifierCategoriesContent = () => {
  return (
    <div className="p-6">
      <ModifierCategoryFilters />
      <ModifierCategoryTable />
      <ModifierCategoryDialog />
    </div>
  );
};

// Main page component that provides the context
const ModifiersCategories = () => {
  return (
    <ModifierCategoriesProvider>
      <ModifierCategoriesContent />
    </ModifierCategoriesProvider>
  );
};

export default ModifiersCategories;
