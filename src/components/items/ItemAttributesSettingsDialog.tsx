
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
  restaurantProductId?: string;
  productId?: string;
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

interface RestaurantProductModifier {
  id: string;
  restaurant_product_id: string;
  modifier_id: number;
  price: string;
  online_price: string | null;
  status: number;
  modifiers: Modifier;
}

interface PriceMatrixItem {
  id: number;
  restaurant_product_id: string;
  attribute_value_id: number;
  restaurant_product_modifier_id: string;
  price_adjustment: string;
  product_configuration_attribute_values: {
    id: number;
    attribute_id: number;
    value: string;
    display_value: string;
    base_price: string;
    product_configuration_attributes: {
      id: number;
      name: string;
      display_name: string;
      attribute_type: string;
    };
  };
  restaurant_product_modifiers: {
    id: string;
    restaurant_product_id: string;
    modifier_id: number;
    price: string;
    online_price: string | null;
    status: number;
    modifiers: {
      id: number;
      modifier_category_id: number;
      modifier: string;
      status: number;
      seq_no: number;
      modifier_categories: {
        id: number;
        modifier_category: string;
        status: number;
        is_mandatory: number;
        is_single_select: number;
        seq_no: number;
        restaurant_id: number;
        max: number | null;
        min: number | null;
        is_portion_allowed: number;
      };
    };
  };
}

interface ConfigOption {
  id: number;
  product_id: number;
  attribute_id: number;
  is_required: number;
  min_selections: number;
  max_selections: number;
  sequence: number;
  status: number;
  product_configuration_attributes: {
    id: number;
    name: string;
    display_name: string;
    attribute_type: string;
    is_required: number;
    min_selections: number;
    max_selections: number;
    sequence: number;
    status: number;
    restaurant_id: number;
    product_configuration_attribute_values: Array<{
      id: number;
      attribute_id: number;
      value: string;
      display_value: string;
      base_price: string;
      is_default: number;
      sequence: number;
      status: number;
    }>;
  };
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
  restaurantProductId,
  productId,
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

  // Fetch restaurant product modifiers - API 1
  const { data: restaurantProductModifiers, isLoading: isLoadingModifiers } = useQuery({
    queryKey: ['restaurant-product-modifiers', restaurantProductId, isOpen],
    queryFn: async () => {
      if (!restaurantProductId) return [];
      const response = await api.get('/restaurant-product-modifiers', { 
        params: {
          per_page: 9999,
          restaurant_product_id: restaurantProductId
        }
      });
      console.log('Restaurant Product Modifiers Response:', response);
      return response.data?.restaurant_product_modifiers || response.restaurant_product_modifiers || [];
    },
    enabled: isOpen && !!restaurantProductId,
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch modifier categories - API 2
  const { data: modifierCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['modifier-categories', isOpen],
    queryFn: async () => {
      const response = await api.get('/modifier-categories', { 
        params: {
          per_page: 9999,
          with_pre_defines: 1
        }
      });
      console.log('Modifier Categories Response:', response);
      return response.data?.modifier_categories || response.modifier_categories || [];
    },
    enabled: isOpen,
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch modifiers by category - New API call
  const { data: modifiersByCategory, isLoading: isLoadingModifiersByCategory } = useQuery({
    queryKey: ['modifiers-by-category', currentAttribute.modifierCategory],
    queryFn: async () => {
      if (!currentAttribute.modifierCategory) return [];
      const response = await api.get('/modifiers', {
        params: {
          per_page: 9999,
          modifier_category_id: currentAttribute.modifierCategory,
          with_pre_defines: 1
        }
      });
      console.log('Modifiers by Category Response:', response);
      return response.data?.modifiers || response.modifiers || [];
    },
    enabled: !!currentAttribute.modifierCategory && currentAttribute.modifierCategory !== "",
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch price matrix - API 3
  const { data: priceMatrix, isLoading: isLoadingPriceMatrix } = useQuery({
    queryKey: ['price-matrix', restaurantProductId, isOpen],
    queryFn: async () => {
      if (!restaurantProductId) return [];
      const response = await api.get('/v2/products/price-matrix', { 
        params: {
          restaurant_product_id: restaurantProductId
        }
      });
      console.log('Price Matrix Response:', response);
      return response.data || response || [];
    },
    enabled: isOpen && !!restaurantProductId,
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch config options - API 4
  const { data: configOptions, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['config-options', productId, isOpen],
    queryFn: async () => {
      if (!productId) return [];
      const response = await api.get('/v2/products/config-options', { 
        params: {
          product_id: productId
        }
      });
      console.log('Config Options Response:', response);
      return response.data || response || [];
    },
    enabled: isOpen && !!productId,
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch attribute values when primary attribute is selected
  const { data: attributeValues, isLoading: isLoadingAttributeValues } = useQuery({
    queryKey: ['attribute-values', currentAttribute.primaryAttribute],
    queryFn: async () => {
      if (!currentAttribute.primaryAttribute) return [];
      const response = await api.get('/v2/products/attribute-values', {
        params: { attribute_id: parseInt(currentAttribute.primaryAttribute) }
      });
      console.log('Attribute Values Response:', response);
      return response.data || response || [];
    },
    enabled: !!currentAttribute.primaryAttribute && currentAttribute.primaryAttribute !== "",
    staleTime: 0,
    cacheTime: 0,
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

  // Loading state
  const isLoading = isLoadingModifiers || isLoadingCategories || isLoadingPriceMatrix || isLoadingConfig;

  // Get primary attribute options from config options
  const primaryAttributeOptions = Array.isArray(configOptions) ? configOptions
    .filter((option: ConfigOption) => option.product_configuration_attributes)
    .map((option: ConfigOption) => ({
      id: option.product_configuration_attributes.id,
      name: option.product_configuration_attributes.name,
      display_name: option.product_configuration_attributes.display_name,
    })) : [];

  // Get filtered attribute values (only active status = 1)
  const filteredAttributeValues = Array.isArray(attributeValues) 
    ? attributeValues.filter((value: any) => value.status === 1) 
    : [];

  // Get filtered modifiers by category (only active status = 1)
  const filteredModifiers = Array.isArray(modifiersByCategory) 
    ? modifiersByCategory.filter((modifier: any) => modifier.status === 1)
    : [];

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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Add attribute form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryAttribute" className="text-sm font-medium">
                    Primary Attribute*
                  </Label>
                  <Select 
                    value={currentAttribute.primaryAttribute} 
                    onValueChange={value => handleChange("primaryAttribute", value)}
                  >
                    <SelectTrigger id="primaryAttribute">
                      <SelectValue placeholder="Select attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryAttributeOptions.map((attribute: any) => (
                        <SelectItem key={attribute.id} value={attribute.id.toString()}>
                          {attribute.name}
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
                      <SelectValue placeholder={
                        isLoadingAttributeValues ? "Loading..." : "Select value"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAttributeValues.map((value: any) => (
                        <SelectItem key={value.id} value={value.id.toString()}>
                          {value.value}
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
                  >
                    <SelectTrigger id="modifierCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(modifierCategories) && modifierCategories.map((category: ModifierCategory) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.modifier_category}
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
                    disabled={!currentAttribute.modifierCategory || isLoadingModifiersByCategory}
                  >
                    <SelectTrigger id="modifier">
                      <SelectValue placeholder={
                        isLoadingModifiersByCategory ? "Loading..." : "Select modifier"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredModifiers.map((modifier: any) => (
                        <SelectItem key={modifier.id} value={modifier.id.toString()}>
                          {modifier.modifier}
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
                            <TableCell>{attr.primaryAttribute}</TableCell>
                            <TableCell>{attr.primaryAttributeValue}</TableCell>
                            <TableCell>{attr.modifierCategory}</TableCell>
                            <TableCell>{attr.modifier}</TableCell>
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

              {/* Modifier List - Display Price Matrix Data */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Modifier List</h3>
                {!priceMatrix || !Array.isArray(priceMatrix) || priceMatrix.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 border rounded-md">
                    No modifier data available
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
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {priceMatrix.map((item: PriceMatrixItem) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.product_configuration_attribute_values?.product_configuration_attributes?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {item.product_configuration_attribute_values?.display_value || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {item.restaurant_product_modifiers?.modifiers?.modifier_categories?.modifier_category || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {item.restaurant_product_modifiers?.modifiers?.modifier || 'N/A'}
                            </TableCell>
                            <TableCell>
                              ${parseFloat(item.price_adjustment || '0').toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                Edit
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
