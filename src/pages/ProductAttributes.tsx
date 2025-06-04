import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useAttributeForm,
  useAttributeValueForm,
  useAttributesList,
  useAttributeValues
} from "@/hooks/product-attributes";
import { 
  AttributeTable, 
  AttributeFilters,
  AttributeDialog,
  AddAttributeValueDialog
} from "@/components/product-attributes";
import { useState, useEffect } from "react";
import { ProductAttribute } from "@/types/productAttributes";
import { createAttributeValue } from "@/services/api/products/attributeValues";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const ProductAttributes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for viewing attribute details
  const [viewingAttribute, setViewingAttribute] = useState<ProductAttribute | null>(null);
  const [isViewingAttribute, setIsViewingAttribute] = useState(false);
  const [isAddingValue, setIsAddingValue] = useState(false);

  // Use individual, focused hooks
  const {
    filterParams,
    searchTerm,
    expandedAttribute,
    attributes,
    totalItems,
    pagination,
    isLoading,
    setSearchTerm,
    handleFilterChange,
    handleSearch,
    clearSearch,
    handlePageChange,
    handlePageSizeChange,
    toggleAttributeExpand
  } = useAttributesList();

  // Debug expanded attribute
  useEffect(() => {
    console.log("Expanded attribute ID:", expandedAttribute);
  }, [expandedAttribute]);

  const {
    isAddingAttribute,
    isEditingAttribute,
    selectedAttribute,
    attributeFormData,
    createAttributeMutation,
    updateAttributeMutation,
    setIsAddingAttribute,
    setAttributeFormData,
    handleAttributeFormSubmit,
    handleEditAttribute,
    handleViewAttribute: originalHandleViewAttribute,
    closeAttributeDialog
  } = useAttributeForm();

  // Wrap the view handler to show the attribute details dialog
  const handleViewAttribute = (attribute: ProductAttribute) => {
    originalHandleViewAttribute(attribute);
    setViewingAttribute(attribute);
    setIsViewingAttribute(true);
  };

  // Close view dialog
  const closeViewDialog = () => {
    setIsViewingAttribute(false);
    setViewingAttribute(null);
  };

  // Get attribute values for the expanded attribute
  const {
    attributeValues,
    isLoadingValues,
    refetchValues
  } = useAttributeValues(expandedAttribute);

  // Debug attribute values
  useEffect(() => {
    console.log("Attribute values from hook:", attributeValues);
  }, [attributeValues]);

  const {
    createAttributeValueMutation,
  } = useAttributeValueForm(selectedAttribute);

  // Handle adding a new attribute value
  const handleAddAttributeValue = () => {
    setIsAddingValue(true);
  };

  // Handle attribute value submission
  const handleAttributeValueSubmit = async (data: {
    value: string;
    displayValue: string;
    basePrice: number;
    isDefault: boolean;
    isActive: boolean;
  }) => {
    if (!expandedAttribute) return;

    try {
      await createAttributeValue({
        value: data.value,
        display_value: data.displayValue,
        base_price: data.basePrice.toString(),
        status: data.isActive ? 1 : 0,
        is_default: data.isDefault ? 1 : 0,
        attribute_id: expandedAttribute
      });

      // Show success message
      toast({
        title: "Success",
        description: "Attribute value added successfully",
      });

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['attribute-values', expandedAttribute] });
      await queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
      
      // Close the dialog
      setIsAddingValue(false);
    } catch (error) {
      console.error('Failed to create attribute value:', error);
      toast({
        title: "Error",
        description: "Failed to add attribute value",
        variant: "destructive",
      });
    }
  };

  // Wrap attribute expand to ensure we only pass the ID
  const handleToggleExpand = (attribute: ProductAttribute) => {
    console.log("Toggling expansion for attribute:", attribute);
    toggleAttributeExpand(attribute.id);
  };

  return (
    <div className="p-6">
      {/* Filter section and add button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <AttributeFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={clearSearch}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        <Button 
          onClick={() => setIsAddingAttribute(true)}
          className="bg-[#6E41E2] hover:bg-[#5835B0] text-white px-4 py-2 flex items-center gap-2 h-9 rounded-md ml-4"
          title="Add New"
        >
          <Plus className="h-4 w-4" />
          Add Attribute
        </Button>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-t-xl shadow">
        <AttributeTable 
          attributes={attributes}
          attributeValues={attributeValues}
          totalItems={totalItems}
          expandedAttribute={attributes.find(attr => attr.id === expandedAttribute) || null}
          isLoading={isLoading}
          currentPage={pagination.page}
          pageSize={pagination.per_page}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onToggleExpand={handleToggleExpand}
          onEditAttribute={handleEditAttribute}
          onViewAttribute={handleViewAttribute}
          onAddAttributeValue={handleAddAttributeValue}
        />
      </div>

      {/* Add/Edit Attribute Dialog */}
      <AttributeDialog 
        isOpen={isAddingAttribute || isEditingAttribute}
        isEditing={isEditingAttribute}
        formData={attributeFormData}
        onFormDataChange={setAttributeFormData}
        onSubmit={handleAttributeFormSubmit}
        onClose={closeAttributeDialog}
        mutation={isEditingAttribute ? updateAttributeMutation : createAttributeMutation}
      />

      {/* View Attribute Dialog */}
      {viewingAttribute && (
        <AttributeDialog 
          isOpen={isViewingAttribute}
          isEditing={false}
          isViewMode={true}
          formData={{
            name: viewingAttribute.name,
            display_name: viewingAttribute.display_name,
            attribute_type: viewingAttribute.attribute_type,
            is_required: viewingAttribute.is_required,
            min_selections: viewingAttribute.min_selections,
            max_selections: viewingAttribute.max_selections,
            status: viewingAttribute.status
          }}
          onFormDataChange={() => {}} // Read-only
          onSubmit={(e) => {
            e.preventDefault();
            closeViewDialog();
          }}
          onClose={closeViewDialog}
          mutation={{
            isPending: false
          } as any}
        />
      )}

      {/* Add Attribute Value Dialog */}
      <AddAttributeValueDialog
        open={isAddingValue}
        onOpenChange={setIsAddingValue}
        onSubmit={handleAttributeValueSubmit}
      />
    </div>
  );
};

export default ProductAttributes;
