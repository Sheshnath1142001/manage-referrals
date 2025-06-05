
import { BulkEditDialog } from "@/components/items/BulkEditDialog";
import { ItemDialog } from "@/components/items/ItemDialog";
import { ItemsFilter } from "@/components/items/ItemsFilter";
import { ItemsTable } from "@/components/items/ItemsTable";
import { useItemForm } from "@/hooks/useItemForm";
import { useItems } from "@/hooks/useItems";
import { useState } from "react";

const Items = () => {
   const {
    availableCategories: allCategories,
  } = useItems({categoryPageNumber: 1, categoryPerPage: 99999});

  const {
    items,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    pageSize,
    isLoading,
    totalItems,
    availableCategories,
    discountTypes,
    quantityUnits,
    locations,
    fetchItems,
    handlePageChange,
    handlePageSizeChange,
    selectedItems,
    setSelectedItems,
    toggleItemSelection,
    toggleSelectAll,
    updateBulkStatus
  } = useItems({});

  const {
    isItemDialogOpen,
    setIsItemDialogOpen,
    isViewMode,
    editingItem,
    formData,
    updateFormField,
    resetForm,
    handleItemAction,
    restaurants
  } = useItemForm();

  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);

  const handleBulkEdit = () => {
    if (selectedItems.length > 0) {
      setIsBulkEditDialogOpen(true);
    }
  };

  return (
    <div className="p-6">
      <ItemsFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        categories={allCategories}
        isLoading={isLoading}
        fetchItems={fetchItems}
        resetForm={resetForm}
        setIsItemDialogOpen={setIsItemDialogOpen}
      />

      <ItemsTable 
        items={items}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        handleItemAction={handleItemAction}
        selectedItems={selectedItems}
        toggleItemSelection={toggleItemSelection}
        toggleSelectAll={toggleSelectAll}
        updateBulkStatus={updateBulkStatus}
        onBulkEdit={handleBulkEdit}
      />

      <ItemDialog 
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        isViewMode={isViewMode}
        editingItem={editingItem}
        formData={formData}
        updateFormField={updateFormField}
        resetForm={resetForm}
        fetchItems={fetchItems}
        categories={availableCategories}
        quantityUnits={quantityUnits}
        locations={locations}
        discountTypes={discountTypes}
        allCategories={allCategories}
        restaurants={restaurants}
      />

      <BulkEditDialog
        isOpen={isBulkEditDialogOpen}
        onOpenChange={setIsBulkEditDialogOpen}
        selectedItems={selectedItems}
        onBulkUpdateSuccess={fetchItems}
        categories={availableCategories}
        quantityUnits={quantityUnits}
        discountTypes={discountTypes}
      />
    </div>
  );
};

export default Items;
