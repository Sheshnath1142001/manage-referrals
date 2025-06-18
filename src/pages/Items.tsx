import { BulkEditDialog } from "@/components/items/BulkEditDialog";
import { ItemDialog } from "@/components/items/ItemDialog";
import { ItemsFilter } from "@/components/items/ItemsFilter";
import { ItemsTable } from "@/components/items/ItemsTable";
import { useItemForm } from "@/hooks/useItemForm";
import { useItems } from "@/hooks/useItems";
import { useState } from "react";

const Items = () => {
  const {
    items,
    searchTerm,
    setSearchTerm,
    barcodeSearch,
    setBarcodeSearch,
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
    updateBulkStatus,
    cloneItems
  } = useItems({
    categoryPageNumber: 1,
    categoryPerPage: 99999
  });

  const {
    isItemDialogOpen,
    setIsItemDialogOpen,
    isViewMode,
    editingItem,
    formData,
    updateFormField,
    resetForm,
    handleItemAction,
    setDefaultLocation
  } = useItemForm();

  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);

  const handleBulkEdit = () => {
    if (selectedItems.length > 0) {
      setIsBulkEditDialogOpen(true);
    }
  };

  // Modified resetForm function that sets default location and category
  const resetFormWithLocation = () => {
    resetForm(locations, availableCategories);
  };

  return (
    <div className="p-3 sm:p-6">
      <ItemsFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        barcodeSearch={barcodeSearch}
        setBarcodeSearch={setBarcodeSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        categories={availableCategories}
        isLoading={isLoading}
        fetchItems={fetchItems}
        resetForm={resetFormWithLocation}
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
        onClone={cloneItems}
      />

      <ItemDialog 
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        isViewMode={isViewMode}
        editingItem={editingItem}
        formData={formData}
        updateFormField={updateFormField}
        resetForm={resetFormWithLocation}
        fetchItems={fetchItems}
        categories={availableCategories}
        quantityUnits={quantityUnits}
        locations={locations}
        discountTypes={discountTypes}
        allCategories={availableCategories}
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
