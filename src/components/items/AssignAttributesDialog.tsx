import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Plus, Edit, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { toast } from "@/hooks/use-toast";

interface AssignAttributesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string | number;
}

interface Attribute {
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
  product_configuration_attribute_values?: AttributeValue[];
}

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  display_value: string;
  base_price: string;
  is_default: number;
  sequence: number;
  status: number;
}

interface AttributeConfig {
  attributeId: string;
  attributeName: string;
  minSelections: string;
  maxSelections: string;
  isActive: boolean;
  isRequired: boolean;
  isEditing?: boolean;
  configId?: number; // Store ProductConfigOption.id for API calls
}

interface ProductConfigOption {
  id: number;
  product_id: number;
  attribute_id: number;
  is_required: number;
  min_selections: number;
  max_selections: number;
  sequence: number;
  status: number;
  product_configuration_attributes: Attribute;
}

export const AssignAttributesDialog = ({
  open,
  onOpenChange,
  productId = ""
}: AssignAttributesDialogProps) => {
  const [selectedAttribute, setSelectedAttribute] = useState<string>("");
  const [currentConfig, setCurrentConfig] = useState<AttributeConfig>({
    attributeId: "",
    attributeName: "",
    minSelections: "0",
    maxSelections: "1",
    isActive: true,
    isRequired: false
  });
  const [existingAttributes, setExistingAttributes] = useState<AttributeConfig[]>([]);
  const [newlyAddedAttributes, setNewlyAddedAttributes] = useState<AttributeConfig[]>([]);
  const queryClient = useQueryClient();

  // Fetch all available product attributes
  const { data: attributesData, isLoading: isAttributesLoading, error: attributesError } = useQuery({
    queryKey: ['productAttributes'],
    queryFn: async () => {
      try {
        const response = await api.get('/v2/products/attributes');
        return response?.data || [];
      } catch (error) {
        
        throw error;
      }
    },
    enabled: open
  });

  // Fetch product-specific configuration options
  const { data: configOptions, isLoading: isConfigLoading, error: configError } = useQuery({
    queryKey: ['productConfigOptions', productId],
    queryFn: async () => {
      if (!productId) return [];
      try {
        
        const response = await api.get(`/v2/products/config-options?product_id=${productId}`);
        
        return response?.data || response || [];
      } catch (error) {
        
        throw error;
      }
    },
    enabled: open && !!productId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Save attributes mutation
  const saveAttributesMutation = useMutation({
    mutationFn: async (attributes: { product_id: number; attributes: any[] }) => {
      const response = await api.post('/v2/products/config-options', attributes);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attributes assigned successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['productConfigOptions', productId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save attributes",
        variant: "destructive"
      });
    }
  });

  // Update individual attribute mutation
  const updateAttributeMutation = useMutation({
    mutationFn: async (data: { configId: number; min_selections: number; max_selections: number; is_required: number; status: number }) => {
      const { configId, ...payload } = data;
      const response = await api.put(`/v2/products/config-options/${configId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attribute updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['productConfigOptions', productId] });
    },
    onError: (error: any) => {
      
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update attribute",
        variant: "destructive"
      });
    }
  });

  // Handle individual attribute save
  const handleSaveIndividualAttribute = (attributeId: string) => {
    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find the attribute being edited
      const attribute = allAttributes.find(attr => attr.attributeId === attributeId);
      if (!attribute) {
        toast({
          title: "Error",
          description: "Attribute not found",
          variant: "destructive"
        });
        return;
      }

      // Check if configId is available (only for existing attributes)
      if (!attribute.configId) {
        toast({
          title: "Error",
          description: "Configuration ID not found. This might be a newly added attribute.",
          variant: "destructive"
        });
        return;
      }

      const payload = {
        configId: attribute.configId,
        min_selections: parseInt(attribute.minSelections),
        max_selections: parseInt(attribute.maxSelections),
        is_required: attribute.isRequired ? 1 : 0,
        status: attribute.isActive ? 1 : 0
      };

      console.log("Updating individual attribute with clean payload:", {
        url: `/v2/products/config-options/${attribute.configId}`,
        payload: {
          min_selections: parseInt(attribute.minSelections),
          max_selections: parseInt(attribute.maxSelections),
          is_required: attribute.isRequired ? 1 : 0,
          status: attribute.isActive ? 1 : 0
        }
      });
      updateAttributeMutation.mutate(payload);

      // Exit edit mode after successful submission
      toggleEditMode(attributeId);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to prepare attribute data for updating",
        variant: "destructive"
      });
    }
  };

  // Load existing product configuration attributes when data is available
  useEffect(() => {
    

    if (configOptions && Array.isArray(configOptions) && configOptions.length > 0) {
      

      const existingAttrs = configOptions.map((option: ProductConfigOption) => {
        const configAttributes = option?.product_configuration_attributes;

        let attributeName = 'Unknown Attribute';

        if (configAttributes && typeof configAttributes === 'object') {
          attributeName = configAttributes.name || 
                        configAttributes.display_name || 
                        'Unknown Attribute';
        }

        const mappedAttribute: AttributeConfig = {
          attributeId: option.attribute_id.toString(),
          attributeName: attributeName,
          minSelections: option.min_selections.toString(),
          maxSelections: option.max_selections.toString(),
          isActive: option.status === 1,
          isRequired: option.is_required === 1,
          configId: option.id
        };

        return mappedAttribute;
      });

      
      setExistingAttributes(existingAttrs);
      // Clear newly added attributes when loading existing ones
      setNewlyAddedAttributes([]);
    } else {
      
      setExistingAttributes([]);
    }
  }, [configOptions]);

  // Combine existing and newly added attributes for display
  const allAttributes = [...existingAttributes, ...newlyAddedAttributes];

  // Handle error states
  useEffect(() => {
    if (attributesError) {
      toast({
        title: "Error",
        description: "Failed to load product attributes",
        variant: "destructive"
      });
    }

    if (configError) {
      toast({
        title: "Error",
        description: "Failed to load product configuration options",
        variant: "destructive"
      });
    }
  }, [attributesError, configError]);

  useEffect(() => {
    if (open) {
      

      if (!productId) {
        
        toast({
          title: "Warning",
          description: "Missing product ID. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [open, productId]);

  const attributeOptions = attributesData?.filter(
    (attr: Attribute) => !allAttributes.some(added => added.attributeId === attr.id.toString())
  ) || [];

  const handleAttributeSelect = (value: string) => {
    const attribute = attributesData?.find((attr: Attribute) => attr.id.toString() === value);
    if (attribute) {
      setSelectedAttribute(value);
      setCurrentConfig({
        attributeId: value,
        attributeName: attribute.name,
        minSelections: attribute.min_selections?.toString() || "0",
        maxSelections: attribute.max_selections?.toString() || "1",
        isActive: attribute.status === 1,
        isRequired: attribute.is_required === 1
      });
    }
  };

  const handleAddAttribute = () => {
    if (currentConfig.attributeId) {
      setNewlyAddedAttributes(prev => [...prev, currentConfig]);
      setSelectedAttribute("");
      setCurrentConfig({
        attributeId: "",
        attributeName: "",
        minSelections: "0",
        maxSelections: "1",
        isActive: true,
        isRequired: false
      });
    }
  };

  const removeAttribute = (attributeId: string) => {
    // Check if it's an existing attribute or newly added
    const isExisting = existingAttributes.some(attr => attr.attributeId === attributeId);
    
    if (isExisting) {
      // Remove from existing attributes
      setExistingAttributes(prev => prev.filter(attr => attr.attributeId !== attributeId));
    } else {
      // Remove from newly added attributes
      setNewlyAddedAttributes(prev => prev.filter(attr => attr.attributeId !== attributeId));
    }
  };

  const toggleEditMode = (attributeId: string) => {
    // Check if it's an existing attribute or newly added
    const isExisting = existingAttributes.some(attr => attr.attributeId === attributeId);
    
    if (isExisting) {
      setExistingAttributes(prev => prev.map(attr => 
        attr.attributeId === attributeId 
          ? { ...attr, isEditing: !attr.isEditing }
          : { ...attr, isEditing: false }
      ));
    } else {
      setNewlyAddedAttributes(prev => prev.map(attr => 
        attr.attributeId === attributeId 
          ? { ...attr, isEditing: !attr.isEditing }
          : { ...attr, isEditing: false }
      ));
    }
  };

  const updateAttribute = (attributeId: string, updates: Partial<AttributeConfig>) => {
    // Check if it's an existing attribute or newly added
    const isExisting = existingAttributes.some(attr => attr.attributeId === attributeId);
    
    if (isExisting) {
      setExistingAttributes(prev => prev.map(attr => 
        attr.attributeId === attributeId 
          ? { ...attr, ...updates }
          : attr
      ));
    } else {
      setNewlyAddedAttributes(prev => prev.map(attr => 
        attr.attributeId === attributeId 
          ? { ...attr, ...updates }
          : attr
      ));
    }
  };

  const handleSubmit = () => {
    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        variant: "destructive"
      });
      return;
    }

    try {
      

      const productIdNumber = typeof productId === 'string' 
        ? parseInt(productId, 10) 
        : productId;

      if (isNaN(productIdNumber)) {
        throw new Error(`Invalid product ID format: ${productId}`);
      }

      // Only send newly added attributes in payload
      const payload = {
        product_id: productIdNumber,
        attributes: newlyAddedAttributes.map(attr => ({
          attribute_id: parseInt(attr.attributeId),
          max_selections: parseInt(attr.maxSelections),
          min_selections: parseInt(attr.minSelections),
          is_required: attr.isRequired ? 1 : 0
        }))
      };

      

      if (payload.attributes.length === 0) {
        toast({
          title: "Warning",
          description: "No new attributes to save",
          variant: "destructive"
        });
        return;
      }

      saveAttributesMutation.mutate(payload);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to prepare attribute data for saving",
        variant: "destructive"
      });
    }
  };

  const isLoading = isAttributesLoading || isConfigLoading || saveAttributesMutation.isPending || updateAttributeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Assign Attributes</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
              <div className="text-center">
                <p>Loading attributes...</p>
                {productId && (
                  <p className="text-sm text-gray-500">Product ID: {productId}</p>
                )}
              </div>
            </div>
          ) : (attributesError || configError) ? (
            <div className="flex justify-center items-center py-6">
              <div className="text-center text-red-600">
                <p>Error loading attributes</p>
                {attributesError && (
                  <p className="text-sm">Attributes Error: {attributesError.message}</p>
                )}
                {configError && (
                  <p className="text-sm">Config Error: {configError.message}</p>
                )}
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Attribute</Label>
                <Select value={selectedAttribute} onValueChange={handleAttributeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributeOptions.map((option: Attribute) => (
                      <SelectItem 
                        key={option.id} 
                        value={option.id.toString()}
                      >
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAttribute && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Selections</Label>
                      <Input
                        type="number"
                        value={currentConfig.minSelections}
                        onChange={(e) => setCurrentConfig(prev => ({
                          ...prev,
                          minSelections: e.target.value
                        }))}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Selections</Label>
                      <Input
                        type="number"
                        value={currentConfig.maxSelections}
                        onChange={(e) => setCurrentConfig(prev => ({
                          ...prev,
                          maxSelections: e.target.value
                        }))}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Active</Label>
                      <Switch
                        checked={currentConfig.isActive}
                        onCheckedChange={(checked) => setCurrentConfig(prev => ({
                          ...prev,
                          isActive: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Required</Label>
                      <Switch
                        checked={currentConfig.isRequired}
                        onCheckedChange={(checked) => setCurrentConfig(prev => ({
                          ...prev,
                          isRequired: checked
                        }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddAttribute}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attribute
                  </Button>
                </div>
              )}

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Selected Attributes</h3>
                <div className="space-y-3">
                  {allAttributes.map((attr, index) => {
                    const isExisting = existingAttributes.some(existingAttr => existingAttr.attributeId === attr.attributeId);
                    return (
                      <div 
                        key={`${attr.attributeId}-${index}`}
                        className={`border rounded-md overflow-hidden ${
                          isExisting ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {attr.isEditing ? (
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{attr.attributeName}</p>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleEditMode(attr.attributeId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Minimum Selections</Label>
                                <Input
                                  type="number"
                                  value={attr.minSelections}
                                  onChange={(e) => updateAttribute(attr.attributeId, {
                                    minSelections: e.target.value
                                  })}
                                  min="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Maximum Selections</Label>
                                <Input
                                  type="number"
                                  value={attr.maxSelections}
                                  onChange={(e) => updateAttribute(attr.attributeId, {
                                    maxSelections: e.target.value
                                  })}
                                  min="1"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label>Active</Label>
                                <Switch
                                  checked={attr.isActive}
                                  onCheckedChange={(checked) => updateAttribute(attr.attributeId, {
                                    isActive: checked
                                  })}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label>Required</Label>
                                <Switch
                                  checked={attr.isRequired}
                                  onCheckedChange={(checked) => updateAttribute(attr.attributeId, {
                                    isRequired: checked
                                  })}
                                />
                              </div>
                            </div>

                            {/* Submit Button for Individual Attribute */}
                            <div className="flex justify-end gap-2 pt-3 border-t">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleEditMode(attr.attributeId)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleSaveIndividualAttribute(attr.attributeId)}
                                disabled={updateAttributeMutation.isPending}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {updateAttributeMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  'Save Changes'
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className={`font-medium text-lg ${
                                    isExisting ? 'text-blue-600' : 'text-green-600'
                                  }`}>
                                    {attr.attributeName}
                                  </h4>
                                  {isExisting && (
                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                      Existing
                                    </span>
                                  )}
                                  {!isExisting && (
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                      New
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    attr.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {attr.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  {attr.isRequired && (
                                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  Selections: {attr.minSelections} - {attr.maxSelections}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleEditMode(attr.attributeId)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {allAttributes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No attributes assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={newlyAddedAttributes.length === 0 || isLoading}
            >
              {saveAttributesMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Attributes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};