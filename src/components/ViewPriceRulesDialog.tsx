import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PriceRule {
  id: number;
  restaurant_product_id: string;
  product_name: string;
  primary_attribute: {
    value_id: number;
    value: string;
    attribute_name: string;
  };
  dependent_attribute: {
    value_id: number;
    value: string;
    attribute_name: string;
  };
  price_adjustment: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  success?: boolean;
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
    product_configuration_attribute_values: AttributeValue[];
  };
}

interface ViewPriceRulesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  restaurantProductId: string;
}

export const ViewPriceRulesDialog = ({
  isOpen,
  onOpenChange,
  productId,
  restaurantProductId,
}: ViewPriceRulesDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPrimaryAttributeId, setSelectedPrimaryAttributeId] = useState<string>("");
  const [selectedDependentAttributeId, setSelectedDependentAttributeId] = useState<string>("");
  const [pendingRules, setPendingRules] = useState<Array<{
    primary_attribute_value_id: string;
    dependent_attribute_value_id: string;
    price_adjustment: string;
    primary_attribute_name: string;
    primary_value_name: string;
    dependent_attribute_name: string;
    dependent_value_name: string;
  }>>([]);
  const [newRule, setNewRule] = useState({
    primary_attribute_value_id: "",
    dependent_attribute_value_id: "",
    price_adjustment: "",
  });
  
  // Edit and Delete dialog states
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    rule: null as PriceRule | null,
    priceAdjustment: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    rule: null as PriceRule | null,
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch configuration options
  const { data: configOptions, isLoading: isLoadingConfig } = useQuery<ConfigOption[]>({
    queryKey: ['configOptions', productId],
    queryFn: async () => {
      const response = await api.get<ConfigOption[]>(`/v2/products/config-options?product_id=${productId}`);
      
      return response; // Return response directly since API returns array directly
    },
    enabled: isOpen && !!productId,
  });

  // Fetch price rules
  const { data: priceRules, isLoading: isLoadingRules, refetch: refetchPriceRules } = useQuery<PriceRule[]>({
    queryKey: ['priceRules', restaurantProductId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { price_rules: PriceRule[]; pagination: any } }>(`/v2/products/product-price-rules?restaurant_product_id=${restaurantProductId}`);
      
      return response.data.price_rules;
    },
    enabled: isOpen && !!restaurantProductId,
  });

  // Get available attributes for both dropdowns
  const availableAttributes = configOptions?.filter(option => option.status === 1) || [];

  // Get primary dropdown options (exclude selected dependent)
  const primaryAttributeOptions = availableAttributes.filter(
    option => option.attribute_id.toString() !== selectedDependentAttributeId
  );

  // Get dependent dropdown options (exclude selected primary)
  const dependentAttributeOptions = availableAttributes.filter(
    option => option.attribute_id.toString() !== selectedPrimaryAttributeId
  );

  // Fetch primary attribute values
  const { data: primaryAttributeValues, isLoading: isLoadingPrimaryValues } = useQuery<AttributeValue[]>({
    queryKey: ['attributeValues', selectedPrimaryAttributeId],
    queryFn: async () => {
      if (!selectedPrimaryAttributeId) return [];
      const response = await api.get<AttributeValue[]>(`/v2/products/attribute-values?attribute_id=${selectedPrimaryAttributeId}`);
      
      return response.filter(val => val.status === 1); // Filter active values
    },
    enabled: isOpen && !!selectedPrimaryAttributeId,
  });

  // Fetch dependent attribute values
  const { data: dependentAttributeValues, isLoading: isLoadingDependentValues } = useQuery<AttributeValue[]>({
    queryKey: ['attributeValues', selectedDependentAttributeId],
    queryFn: async () => {
      if (!selectedDependentAttributeId) return [];
      const response = await api.get<AttributeValue[]>(`/v2/products/attribute-values?attribute_id=${selectedDependentAttributeId}`);
      
      return response.filter(val => val.status === 1); // Filter active values
    },
    enabled: isOpen && !!selectedDependentAttributeId,
  });

  // Reset dependent values when primary changes
  useEffect(() => {
    setNewRule(prev => ({
      ...prev,
      primary_attribute_value_id: "",
    }));
  }, [selectedPrimaryAttributeId]);

  // Reset primary values when dependent changes
  useEffect(() => {
    setNewRule(prev => ({
      ...prev,
      dependent_attribute_value_id: "",
    }));
  }, [selectedDependentAttributeId]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPrimaryAttributeId("");
      setSelectedDependentAttributeId("");
      setPendingRules([]);
      setNewRule({
        primary_attribute_value_id: "",
        dependent_attribute_value_id: "",
        price_adjustment: "",
      });
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setNewRule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle attribute selection changes
  const handlePrimaryAttributeChange = (value: string) => {
    setSelectedPrimaryAttributeId(value);
    setNewRule(prev => ({
      ...prev,
      primary_attribute_value_id: "",
    }));
  };

  const handleDependentAttributeChange = (value: string) => {
    setSelectedDependentAttributeId(value);
    setNewRule(prev => ({
      ...prev,
      dependent_attribute_value_id: "",
    }));
  };

  // Add new price rule to pending list
  const handleAddPriceRule = async () => {
    if (!selectedPrimaryAttributeId || !selectedDependentAttributeId || !newRule.primary_attribute_value_id || !newRule.dependent_attribute_value_id || !newRule.price_adjustment) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Get attribute and value names for display
    const primaryAttribute = availableAttributes.find(attr => attr.attribute_id.toString() === selectedPrimaryAttributeId);
    const dependentAttribute = availableAttributes.find(attr => attr.attribute_id.toString() === selectedDependentAttributeId);
    const primaryValue = primaryAttributeValues?.find(val => val.id.toString() === newRule.primary_attribute_value_id);
    const dependentValue = dependentAttributeValues?.find(val => val.id.toString() === newRule.dependent_attribute_value_id);

    if (!primaryAttribute || !dependentAttribute || !primaryValue || !dependentValue) {
      toast({
        title: "Error",
        description: "Could not find attribute or value information",
        variant: "destructive",
      });
      return;
    }

    const ruleToAdd = {
      primary_attribute_value_id: newRule.primary_attribute_value_id,
      dependent_attribute_value_id: newRule.dependent_attribute_value_id,
      price_adjustment: newRule.price_adjustment,
      primary_attribute_name: primaryAttribute.product_configuration_attributes.name,
      primary_value_name: primaryValue.display_value,
      dependent_attribute_name: dependentAttribute.product_configuration_attributes.name,
      dependent_value_name: dependentValue.display_value,
    };

    setPendingRules(prev => [...prev, ruleToAdd]);
    
    // Reset form
    setNewRule({
      primary_attribute_value_id: "",
      dependent_attribute_value_id: "",
      price_adjustment: "",
    });
    setSelectedPrimaryAttributeId("");
    setSelectedDependentAttributeId("");
  };

  // Submit all pending rules
  const handleSubmitPriceRules = async () => {
    if (pendingRules.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one price rule",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        restaurant_product_id: restaurantProductId,
        price_rules: pendingRules.map(rule => ({
          primary_attribute_value_id: parseInt(rule.primary_attribute_value_id),
          dependent_attribute_value_id: parseInt(rule.dependent_attribute_value_id),
          price_adjustment: rule.price_adjustment,
        })),
      };
      
      
      const response = await api.post<ApiResponse<any>>('/v2/products/product-price-rules', payload);
      
      
      if (response.success) {
        toast({
          title: "Success",
          description: `${pendingRules.length} price rule(s) added successfully`,
        });
        
        // Reset form and pending rules
        setPendingRules([]);
        setNewRule({
          primary_attribute_value_id: "",
          dependent_attribute_value_id: "",
          price_adjustment: "",
        });
        setSelectedPrimaryAttributeId("");
        setSelectedDependentAttributeId("");
        
        // Refetch price rules
        refetchPriceRules();
      } else {
        throw new Error("Failed to add price rules");
      }
    } catch (error) {
      
      
      toast({
        title: "Error",
        description: "Failed to add price rules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove pending rule
  const handleRemovePendingRule = (index: number) => {
    setPendingRules(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Success",
      description: "Price rule removed from list",
    });
  };

  // Open edit dialog
  const handleEditPriceRule = (rule: PriceRule) => {
    setEditDialog({
      isOpen: true,
      rule: rule,
      priceAdjustment: rule.price_adjustment,
    });
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialog({
      isOpen: false,
      rule: null,
      priceAdjustment: "",
    });
  };

  // Submit edit
  const handleSubmitEdit = async () => {
    if (!editDialog.rule || !editDialog.priceAdjustment) {
      toast({
        title: "Validation Error",
        description: "Please enter a price adjustment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEditSubmitting(true);
      
      const payload = {
        price_adjustment: editDialog.priceAdjustment,
      };
      
      
      const response = await api.put<{ success: boolean; data: any }>(`/v2/products/product-price-rules/${editDialog.rule.id}`, payload);
      
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Price rule updated successfully",
        });
        
        handleCloseEditDialog();
        refetchPriceRules();
      } else {
        throw new Error("Failed to update price rule");
      }
    } catch (error) {
      
      
      toast({
        title: "Error",
        description: "Failed to update price rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (rule: PriceRule) => {
    setDeleteDialog({
      isOpen: true,
      rule: rule,
    });
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      rule: null,
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteDialog.rule) return;

    try {
      setIsDeleting(true);
      
      
      const response = await api.delete<{ success: boolean; message: string }>(`/v2/products/product-price-rules/${deleteDialog.rule.id}`);
      
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Price rule deleted successfully",
        });
        
        handleCloseDeleteDialog();
        refetchPriceRules();
      } else {
        throw new Error("Failed to delete price rule");
      }
    } catch (error) {
      
      
      toast({
        title: "Error",
        description: "Failed to delete price rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get attribute name by ID
  const getAttributeName = (attributeId: number): string => {
    const attribute = availableAttributes?.find(option => 
      option.product_configuration_attributes.id === attributeId
    )?.product_configuration_attributes;
    
    return attribute ? attribute.name : "Unknown";
  };

  // Loading state
  const isLoading = isLoadingConfig || isLoadingRules || isLoadingPrimaryValues || isLoadingDependentValues;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl">Price Adjustments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="w-full flex justify-center p-8">Loading...</div>
          ) : (
            <>
              {/* Add new price rule form */}
              <div className="mb-6 bg-gray-50 p-3 sm:p-4 rounded-md">
                <h3 className="font-medium mb-4 text-sm sm:text-base">Add New Price Adjustment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Select 
                      value={selectedPrimaryAttributeId} 
                      onValueChange={handlePrimaryAttributeChange}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select Primary Attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {primaryAttributeOptions?.map((option) => (
                          <SelectItem key={option.attribute_id} value={option.attribute_id.toString()}>
                            {option.product_configuration_attributes.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={selectedDependentAttributeId} 
                      onValueChange={handleDependentAttributeChange}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select Dependent Attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {dependentAttributeOptions?.map((option) => (
                          <SelectItem key={option.attribute_id} value={option.attribute_id.toString()}>
                            {option.product_configuration_attributes.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={newRule.primary_attribute_value_id} 
                      onValueChange={(value) => handleInputChange("primary_attribute_value_id", value)}
                      disabled={!selectedPrimaryAttributeId}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder={!selectedPrimaryAttributeId ? "Select Primary Attribute First" : "Select Primary Value"} />
                      </SelectTrigger>
                      <SelectContent>
                        {primaryAttributeValues?.map((value: AttributeValue) => (
                          <SelectItem key={value.id} value={value.id.toString()}>
                            {value.display_value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={newRule.dependent_attribute_value_id} 
                      onValueChange={(value) => handleInputChange("dependent_attribute_value_id", value)}
                      disabled={!selectedDependentAttributeId}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder={!selectedDependentAttributeId ? "Select Dependent Attribute First" : "Select Dependent Value"} />
                      </SelectTrigger>
                      <SelectContent>
                        {dependentAttributeValues?.map((value: AttributeValue) => (
                          <SelectItem key={value.id} value={value.id.toString()}>
                            {value.display_value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      placeholder="Price Adjustment"
                      value={newRule.price_adjustment}
                      onChange={(e) => handleInputChange("price_adjustment", e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Button 
                      className="w-full" 
                      onClick={handleAddPriceRule}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Rule
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pending rules display */}
              {pendingRules.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Rules to Submit ({pendingRules.length})</h4>
                  <div className="space-y-2">
                    {pendingRules.map((rule, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-blue-900">
                            {rule.primary_value_name} / {rule.dependent_value_name} - ${rule.price_adjustment}
                          </span>
                          <div className="text-xs text-blue-600 mt-1">
                            {rule.primary_attribute_name}: {rule.primary_value_name} → {rule.dependent_attribute_name}: {rule.dependent_value_name}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePendingRule(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={handleSubmitPriceRules}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? "Submitting..." : "SUBMIT"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Price rules table */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black hover:bg-black">
                      <TableHead className="text-white font-medium text-sm py-2 px-3">Primary Attribute</TableHead>
                      <TableHead className="text-white font-medium text-sm py-2 px-3">Attribute Value</TableHead>
                      <TableHead className="text-white font-medium text-sm py-2 px-3">Dependent Attribute</TableHead>
                      <TableHead className="text-white font-medium text-sm py-2 px-3">Attribute Value</TableHead>
                      <TableHead className="text-white font-medium text-sm py-2 px-3">Price Adjustment</TableHead>
                      <TableHead className="text-white font-medium text-sm py-2 px-3 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceRules?.length > 0 ? (
                      priceRules.map((rule: PriceRule) => (
                        <TableRow key={rule.id} className="border-b hover:bg-gray-50">
                          <TableCell className="py-2 px-3 text-xs font-medium">{rule.primary_attribute.attribute_name}</TableCell>
                          <TableCell className="py-2 px-3 text-xs">{rule.primary_attribute.value}</TableCell>
                          <TableCell className="py-2 px-3 text-xs font-medium">{rule.dependent_attribute.attribute_name}</TableCell>
                          <TableCell className="py-2 px-3 text-xs">{rule.dependent_attribute.value}</TableCell>
                          <TableCell className="py-2 px-3 text-xs font-medium">$ {parseFloat(rule.price_adjustment).toFixed(0)}</TableCell>
                          <TableCell className="py-2 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPriceRule(rule)}
                                className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <span className="text-sm">✏️</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDeleteDialog(rule)}
                                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500 text-xs">
                          No price rules found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Edit Price Adjustment Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl text-black">Edit Price Adjustment</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Price Adjustment*</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={editDialog.priceAdjustment}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, priceAdjustment: e.target.value }))}
                  className="pl-8"
                  step="0.01"
                  min="0"
                  placeholder="Enter price adjustment"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitEdit}
                disabled={isEditSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isEditSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⚠</span>
              </div>
              <div>
                <h3 className="font-medium text-lg">Are you sure, you want to delete matrix?</h3>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={handleCloseDeleteDialog}
                className="px-6"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                {isDeleting ? "DELETING..." : "DELETE"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}; 