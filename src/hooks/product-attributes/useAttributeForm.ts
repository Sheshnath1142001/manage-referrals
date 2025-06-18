import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attributesService } from "@/services/api/items/productAttributes";
import { ProductAttribute, AttributeType } from "@/types/productAttributes";

interface AttributeFormData {
  name: string;
  display_name: string;
  attribute_type: AttributeType;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  status: "Active" | "Inactive";
}

export function useAttributeForm() {
  const queryClient = useQueryClient();
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [isEditingAttribute, setIsEditingAttribute] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
  const [attributeFormData, setAttributeFormData] = useState<AttributeFormData>({
    name: "",
    display_name: "",
    attribute_type: "single_select",
    is_required: false,
    min_selections: 1,
    max_selections: 1,
    status: "Active"
  });

  // Create attribute mutation
  const createAttributeMutation = useMutation({
    mutationFn: async (data: AttributeFormData) => {
      const response = await attributesService.createAttribute({
        name: data.name,
        display_name: data.display_name,
        attribute_type: data.attribute_type,
        is_required: data.is_required ? 1 : 0,
        min_selections: data.min_selections,
        max_selections: data.max_selections,
        status: data.status === "Active" ? 1 : 0,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product attribute created successfully");
      queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
      setIsAddingAttribute(false);
      resetAttributeForm();
    },
    onError: (error) => {
      toast.error("Failed to create product attribute");
      
    }
  });

  // Update attribute mutation
  const updateAttributeMutation = useMutation({
    mutationFn: async (data: AttributeFormData & { id: number }) => {
      const response = await attributesService.updateAttribute(data.id, {
        name: data.name,
        display_name: data.display_name,
        attribute_type: data.attribute_type,
        is_required: data.is_required ? 1 : 0,
        min_selections: data.min_selections,
        max_selections: data.max_selections,
        status: data.status === "Active" ? 1 : 0,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product attribute updated successfully");
      queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
      setIsEditingAttribute(false);
      resetAttributeForm();
    },
    onError: (error) => {
      toast.error("Failed to update product attribute");
      
    }
  });

  // Update attribute sequence mutation
  const updateAttributeSequenceMutation = useMutation({
    mutationFn: (data: { id: number, seq_no: number }) => 
      attributesService.updateProductAttributeSeqNo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
    },
    onError: (error) => {
      toast.error("Failed to update attribute sequence");
      
    }
  });

  // Handle form submission
  const handleAttributeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditingAttribute && selectedAttribute) {
        await updateAttributeMutation.mutateAsync({
          ...attributeFormData,
          id: selectedAttribute.id
        });
      } else {
        await createAttributeMutation.mutateAsync(attributeFormData);
      }
      
      // Reset form and close dialog
      resetAttributeForm();
      setIsAddingAttribute(false);
      setIsEditingAttribute(false);
    } catch (error) {
      
    }
  };

  // Handle attribute editing
  const handleEditAttribute = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    setAttributeFormData({
      name: attribute.name,
      display_name: attribute.display_name,
      attribute_type: attribute.attribute_type,
      is_required: typeof attribute.is_required === 'number' ? attribute.is_required === 1 : attribute.is_required,
      min_selections: attribute.min_selections,
      max_selections: attribute.max_selections,
      status: typeof attribute.status === 'number' 
        ? attribute.status === 1 ? "Active" : "Inactive"
        : attribute.status
    });
    setIsEditingAttribute(true);
  };

  // Handle attribute viewing
  const handleViewAttribute = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
  };

  // Reset attribute form
  const resetAttributeForm = () => {
    setAttributeFormData({
      name: "",
      display_name: "",
      attribute_type: "single_select",
      is_required: false,
      min_selections: 1,
      max_selections: 1,
      status: "Active"
    });
  };

  // Close attribute dialog
  const closeAttributeDialog = () => {
    setIsAddingAttribute(false);
    setIsEditingAttribute(false);
    resetAttributeForm();
  };

  return {
    // State
    isAddingAttribute,
    isEditingAttribute,
    selectedAttribute,
    attributeFormData,
    
    // Mutations
    createAttributeMutation,
    updateAttributeMutation,
    updateAttributeSequenceMutation,
    
    // Actions
    setIsAddingAttribute,
    setAttributeFormData,
    handleAttributeFormSubmit,
    handleEditAttribute,
    handleViewAttribute,
    closeAttributeDialog
  };
}
