
import { useAttributeForm } from './product-attributes/useAttributeForm';
import { useAttributeValueForm } from './product-attributes/useAttributeValueForm';
import { useAttributesList } from './product-attributes/useAttributesList';
import { useAttributeValues } from './product-attributes/useAttributeValues';

export function useProductAttributes() {
  // Use the smaller, focused hooks
  const attributesList = useAttributesList();
  const attributeForm = useAttributeForm();
  const attributeValues = useAttributeValues(attributesList.expandedAttribute);
  const attributeValueForm = useAttributeValueForm(attributeForm.selectedAttribute);

  // Combine and return all the hooks' values and functions
  return {
    // State from attributesList
    filterParams: attributesList.filterParams,
    searchTerm: attributesList.searchTerm,
    expandedAttribute: attributesList.expandedAttribute,
    attributes: attributesList.attributes,
    totalItems: attributesList.totalItems,
    isLoading: attributesList.isLoading,
    
    // State from attributeForm
    isAddingAttribute: attributeForm.isAddingAttribute,
    isEditingAttribute: attributeForm.isEditingAttribute,
    selectedAttribute: attributeForm.selectedAttribute,
    attributeFormData: attributeForm.attributeFormData,
    
    // State from attributeValues
    attributeValues: attributeValues.attributeValues,
    
    // State from attributeValueForm
    isAddingAttributeValue: attributeValueForm.isAddingAttributeValue,
    attributeValueFormData: attributeValueForm.attributeValueFormData,
    
    // Mutations from attributeForm
    createAttributeMutation: attributeForm.createAttributeMutation,
    updateAttributeMutation: attributeForm.updateAttributeMutation,
    
    // Mutations from attributeValueForm
    createAttributeValueMutation: attributeValueForm.createAttributeValueMutation,
    
    // Actions from attributesList
    setSearchTerm: attributesList.setSearchTerm,
    handleFilterChange: attributesList.handleFilterChange,
    handleSearch: attributesList.handleSearch,
    clearSearch: attributesList.clearSearch,
    handlePageChange: attributesList.handlePageChange,
    handlePageSizeChange: attributesList.handlePageSizeChange,
    toggleAttributeExpand: attributesList.toggleAttributeExpand,
    
    // Actions from attributeForm
    handleAttributeFormSubmit: attributeForm.handleAttributeFormSubmit,
    handleEditAttribute: attributeForm.handleEditAttribute,
    handleViewAttribute: attributeForm.handleViewAttribute,
    setAttributeFormData: attributeForm.setAttributeFormData,
    setIsAddingAttribute: attributeForm.setIsAddingAttribute,
    closeAttributeDialog: attributeForm.closeAttributeDialog,
    
    // Actions from attributeValueForm
    handleAttributeValueFormSubmit: attributeValueForm.handleAttributeValueFormSubmit,
    handleAddAttributeValue: () => attributeValueForm.handleAddAttributeValue(attributesList.expandedAttribute),
    setAttributeValueFormData: attributeValueForm.setAttributeValueFormData,
    closeAttributeValueDialog: attributeValueForm.closeAttributeValueDialog
  };
}
