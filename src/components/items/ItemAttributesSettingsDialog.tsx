import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";

// Define interfaces for the dialog props
interface ItemAttributesSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onSave: (attributes: ItemAttribute[]) => void;
}

// Define interfaces for API responses
interface ModifierCategory {
  id: number;
  modifier_category: string;
  is_mandatory: number;
  is_single_select: number;
  status: number;
  min?: number | null;
  max?: number | null;
}

interface Modifier {
  id: number;
  modifier: string;
  modifier_category_id: number;
  modifier_categories: ModifierCategory;
  status: number;
  seq_no: number;
}

interface Attribute {
  id: number;
  attribute: string;
  status: number;
}

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  status: number;
}

// Define interfaces for the attribute data
interface ItemAttribute {
  id?: string;
  primaryAttribute: string;
  primaryAttributeValue: string;
  modifierCategory: string;
  modifier: string;
  priceAdjustment: string;
}

export const ItemAttributesSettingsDialog = ({
  isOpen,
  onOpenChange,
  itemName,
  onSave,
}: ItemAttributesSettingsDialogProps) => {
  const { toast } = useToast();
  const [attributes, setAttributes] = useState<ItemAttribute[]>([]);
  
  // Form state for the current attribute being added
  const [currentAttribute, setCurrentAttribute] = useState<ItemAttribute>({
    primaryAttribute: "",
    primaryAttributeValue: "",
    modifierCategory: "",
    modifier: "",
    priceAdjustment: "",
  });

  // Fetch primary attributes
  const { data: attributesData, isLoading: isLoadingAttributes } = useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const response = await api.get('/attributes', { 
        params: {
          per_page: 9999,
          status: 1
        }
      });
      return response.attributes || [];
    },
    enabled: isOpen // Only fetch when dialog is open
  });

  // Fetch attribute values when primary attribute is selected
  const { data: attributeValuesData, isLoading: isLoadingAttributeValues } = useQuery({
    queryKey: ['attribute-values', currentAttribute.primaryAttribute],
    queryFn: async () => {
      if (!currentAttribute.primaryAttribute) return [];
      const response = await api.get('/attribute-values', { 
        params: {
          per_page: 9999,
          attribute_id: currentAttribute.primaryAttribute,
          status: 1
        }
      });
      return response.attribute_values || [];
    },
    enabled: isOpen && !!currentAttribute.primaryAttribute,
  });

  // Fetch modifier categories
  const { data: modifierCategoriesData, isLoading: isLoadingModifierCategories } = useQuery({
    queryKey: ['modifier-categories'],
    queryFn: async () => {
      const response = await api.get('/modifier-categories', { 
        params: {
          per_page: 9999,
          status: 1
        }
      });
      return response.modifier_categories || [];
    },
    enabled: isOpen // Only fetch when dialog is open
  });

  // Fetch modifiers when modifier category is selected
  const { data: modifiersData, isLoading: isLoadingModifiers } = useQuery({
    queryKey: ['modifiers', currentAttribute.modifierCategory],
    queryFn: async () => {
      if (!currentAttribute.modifierCategory) return [];
      const response = await api.get('/modifiers', { 
        params: {
          per_page: 9999,
          modifier_category_id: currentAttribute.modifierCategory,
          status: 1
        }
      });
      return response.modifiers || [];
    },
    enabled: isOpen && !!currentAttribute.modifierCategory,
  });

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentAttribute({
        primaryAttribute: "",
        primaryAttributeValue: "",
        modifierCategory: "",
        modifier: "",
        priceAdjustment: "",
      });
      setAttributes([]);
    }
  }, [isOpen]);

  // Helper function to get attribute value options
  const getAttributeValueOptions = () => {
    if (!currentAttribute.primaryAttribute || !attributeValuesData) return [];
    return attributeValuesData;
  };

  // Helper function to get modifier options
  const getModifierOptions = () => {
    if (!currentAttribute.modifierCategory || !modifiersData) return [];
    return modifiersData;
  };

  // Handle form field changes
  const handleChange = (field: keyof ItemAttribute, value: string) => {
    setCurrentAttribute(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset dependent fields
      if (field === "primaryAttribute") {
        updated.primaryAttributeValue = "";
      }
      if (field === "modifierCategory") {
        updated.modifier = "";
      }
      
      return updated;
    });
  };

  // Add attribute to the list
  const handleAddAttribute = () => {
    // Validate required fields
    if (!currentAttribute.primaryAttribute || !currentAttribute.primaryAttributeValue || 
        !currentAttribute.modifierCategory || !currentAttribute.modifier || !currentAttribute.priceAdjustment) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // Add attribute with a unique ID
    setAttributes(prev => [
      ...prev, 
      { ...currentAttribute, id: crypto.randomUUID() }
    ]);

    // Reset form
    setCurrentAttribute({
      primaryAttribute: "",
      primaryAttributeValue: "",
      modifierCategory: "",
      modifier: "",
      priceAdjustment: "",
    });
  };

  // Delete attribute from the list
  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  // Save all attributes
  const handleSubmit = () => {
    onSave(attributes);
    onOpenChange(false);
    toast({
      title: "Success",
      description: "Attributes saved successfully",
    });
  };

  // Helper function to get attribute label by id
  const getAttributeLabel = (id: string): string => {
    if (!attributesData) return id;
    const attribute = attributesData.find(attr => attr.id.toString() === id);
    return attribute ? attribute.attribute : id;
  };

  // Helper function to get attribute value label by id
  const getAttributeValueLabel = (attributeId: string, valueId: string): string => {
    if (!attributeValuesData) return valueId;
    const value = attributeValuesData.find(val => val.id.toString() === valueId);
    return value ? value.value : valueId;
  };

  // Helper function to get modifier category label by id
  const getModifierCategoryLabel = (id: string): string => {
    if (!modifierCategoriesData) return id;
    const category = modifierCategoriesData.find(cat => cat.id.toString() === id);
    return category ? category.modifier_category : id;
  };

  // Helper function to get modifier label by id
  const getModifierLabel = (id: string): string => {
    if (!modifiersData) return id;
    const modifier = modifiersData.find(mod => mod.id.toString() === id);
    return modifier ? modifier.modifier : id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="bg-primary text-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {itemName}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Add attribute form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryAttribute" className="text-sm font-medium">
                Primary Attribute*
              </Label>
              <Select 
                value={currentAttribute.primaryAttribute} 
                onValueChange={value => handleChange("primaryAttribute", value)}
                disabled={isLoadingAttributes}
              >
                <SelectTrigger id="primaryAttribute">
                  <SelectValue placeholder={isLoadingAttributes ? "Loading attributes..." : "Select attribute"} />
                </SelectTrigger>
                <SelectContent>
                  {attributesData && attributesData.map((option: Attribute) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.attribute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="primaryAttributeValue" className="text-sm font-medium">
                Primary Attribute Value*
              </Label>
              <Select 
                value={currentAttribute.primaryAttributeValue} 
                onValueChange={value => handleChange("primaryAttributeValue", value)}
                disabled={!currentAttribute.primaryAttribute || isLoadingAttributeValues}
              >
                <SelectTrigger id="primaryAttributeValue">
                  <SelectValue placeholder={isLoadingAttributeValues ? "Loading values..." : "Select value"} />
                </SelectTrigger>
                <SelectContent>
                  {getAttributeValueOptions().map((option: AttributeValue) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="modifierCategory" className="text-sm font-medium">
                Modifier Category*
              </Label>
              <Select 
                value={currentAttribute.modifierCategory} 
                onValueChange={value => handleChange("modifierCategory", value)}
                disabled={isLoadingModifierCategories}
              >
                <SelectTrigger id="modifierCategory">
                  <SelectValue placeholder={isLoadingModifierCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {modifierCategoriesData && modifierCategoriesData.map((option: ModifierCategory) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.modifier_category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="modifier" className="text-sm font-medium">
                Modifier*
              </Label>
              <Select 
                value={currentAttribute.modifier} 
                onValueChange={value => handleChange("modifier", value)}
                disabled={!currentAttribute.modifierCategory || isLoadingModifiers}
              >
                <SelectTrigger id="modifier">
                  <SelectValue placeholder={isLoadingModifiers ? "Loading modifiers..." : "Select modifier"} />
                </SelectTrigger>
                <SelectContent>
                  {getModifierOptions().map((option: Modifier) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.modifier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor="priceAdjustment" className="text-sm font-medium">
                  Price Adjustment*
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                  <Input
                    id="priceAdjustment"
                    value={currentAttribute.priceAdjustment}
                    onChange={e => handleChange("priceAdjustment", e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-6"
                  />
                </div>
              </div>
              <Button 
                className="bg-primary text-white hover:bg-primary/80"
                onClick={handleAddAttribute}
                disabled={isLoadingAttributes || isLoadingAttributeValues || isLoadingModifierCategories || isLoadingModifiers}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Table of added attributes */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Attribute List</h3>
            {attributes.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border rounded-md">
                No data available
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attribute</TableHead>
                      <TableHead>Attribute Value</TableHead>
                      <TableHead>Modifier Category</TableHead>
                      <TableHead>Modifier</TableHead>
                      <TableHead>Price Adjustment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributes.map(attr => (
                      <TableRow key={attr.id}>
                        <TableCell>
                          {getAttributeLabel(attr.primaryAttribute)}
                        </TableCell>
                        <TableCell>
                          {getAttributeValueLabel(attr.primaryAttribute, attr.primaryAttributeValue)}
                        </TableCell>
                        <TableCell>
                          {getModifierCategoryLabel(attr.modifierCategory)}
                        </TableCell>
                        <TableCell>
                          {getModifierLabel(attr.modifier)}
                        </TableCell>
                        <TableCell>${parseFloat(attr.priceAdjustment).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteAttribute(attr.id as string)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="flex justify-center pt-4">
            <Button 
              className="w-full max-w-[200px] bg-primary text-white hover:bg-primary/80"
              onClick={handleSubmit}
              disabled={attributes.length === 0}
            >
              SUBMIT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 