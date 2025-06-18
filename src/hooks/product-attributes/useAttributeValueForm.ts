
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attributeValuesService } from "@/services/api/items/productAttributeValues";
import { AttributeValue, ProductAttribute } from "@/types/productAttributes";

export function useAttributeValueForm(selectedAttribute: ProductAttribute | null) {
  const queryClient = useQueryClient();
  const [isAddingAttributeValue, setIsAddingAttributeValue] = useState(false);
  const [isEditingAttributeValue, setIsEditingAttributeValue] = useState(false);
  const [selectedAttributeValue, setSelectedAttributeValue] = useState<AttributeValue | null>(null);
  const [attributeValueFormData, setAttributeValueFormData] = useState<Partial<AttributeValue>>({
    name: "",
    display_name: "",
    base_price: 0,
    is_default: 0,
    status: 1
  });

  // Create attribute value mutation
  const createAttributeValueMutation = useMutation({
    mutationFn: (data: Partial<AttributeValue>) => {
      const apiData = {
        attribute_id: data.attribute_id,
        value: data.name,
        display_value: data.display_name,
        base_price: typeof data.base_price === 'number' ? data.base_price.toString() : "0",
        is_default: data.is_default === 1 ? 1 : 0,
        status: data.status === 1 ? 1 : 0
      };
      return attributeValuesService.createProductAttributeValues(apiData);
    },
    onSuccess: () => {
      toast.success("Attribute value created successfully");
      queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
      if (selectedAttribute) {
        queryClient.invalidateQueries({ queryKey: ['attribute-values', selectedAttribute.id] });
      }
      setIsAddingAttributeValue(false);
      resetAttributeValueForm();
    },
    onError: (error) => {
      toast.error("Failed to create attribute value");
      
    }
  });

  // Update attribute value mutation
  const updateAttributeValueMutation = useMutation({
    mutationFn: (data: Partial<AttributeValue>) => {
      const apiData = {
        id: data.id,
        attribute_id: data.attribute_id,
        value: data.name,
        display_value: data.display_name,
        base_price: typeof data.base_price === 'number' ? data.base_price.toString() : "0",
        is_default: data.is_default === 1 ? 1 : 0,
        status: data.status === 1 ? 1 : 0
      };
      return attributeValuesService.updateProductAttributeValues(apiData);
    },
    onSuccess: () => {
      toast.success("Attribute value updated successfully");
      queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
      if (selectedAttribute) {
        queryClient.invalidateQueries({ queryKey: ['attribute-values', selectedAttribute.id] });
      }
      setIsEditingAttributeValue(false);
      resetAttributeValueForm();
    },
    onError: (error) => {
      toast.error("Failed to update attribute value");
      
    }
  });

  // Handle attribute value form submission
  const handleAttributeValueFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditingAttributeValue && selectedAttributeValue) {
      updateAttributeValueMutation.mutate({
        ...attributeValueFormData,
        id: selectedAttributeValue.id,
        attribute_id: selectedAttribute?.id
      });
    } else if (selectedAttribute) {
      createAttributeValueMutation.mutate({
        ...attributeValueFormData,
        attribute_id: selectedAttribute.id
      });
    } else {
      toast.error("No attribute selected");
    }
  };

  // Handle edit attribute value
  const handleEditAttributeValue = (value: AttributeValue) => {
    setSelectedAttributeValue(value);
    setAttributeValueFormData({
      name: value.name,
      display_name: value.display_name,
      base_price: value.base_price,
      is_default: value.is_default,
      status: value.status
    });
    setIsEditingAttributeValue(true);
  };

  // Reset attribute value form
  const resetAttributeValueForm = () => {
    setAttributeValueFormData({
      name: "",
      display_name: "",
      base_price: 0,
      is_default: 0,
      status: 1
    });
    setSelectedAttributeValue(null);
  };

  // Close attribute value dialog
  const closeAttributeValueDialog = () => {
    setIsAddingAttributeValue(false);
    setIsEditingAttributeValue(false);
    resetAttributeValueForm();
  };

  // Handle attribute value addition
  const handleAddAttributeValue = (attributeId: number | null) => {
    if (!attributeId) {
      toast.error("Please expand an attribute first");
      return;
    }
    
    if (!selectedAttribute) {
      toast.error("No attribute selected");
      return;
    }
    
    setIsAddingAttributeValue(true);
  };

  return {
    // State
    isAddingAttributeValue,
    isEditingAttributeValue,
    attributeValueFormData,
    selectedAttributeValue,
    
    // Mutations
    createAttributeValueMutation,
    updateAttributeValueMutation,
    
    // Actions
    setIsAddingAttributeValue,
    setAttributeValueFormData,
    handleAttributeValueFormSubmit,
    closeAttributeValueDialog,
    handleAddAttributeValue,
    handleEditAttributeValue
  };
}
