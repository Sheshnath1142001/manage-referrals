import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus } from "lucide-react";
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
  product_configuration_attributes: {
    id: number;
    display_name: string;
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
  const [primaryAttributeId, setPrimaryAttributeId] = useState<number | null>(null);
  const [dependentAttributeId, setDependentAttributeId] = useState<number | null>(null);
  const [newRule, setNewRule] = useState({
    primary_attribute_value_id: "",
    dependent_attribute_value_id: "",
    price_adjustment: "",
  });

  // Fetch configuration options
  const { data: configOptions, isLoading: isLoadingConfig } = useQuery<ConfigOption[]>({
    queryKey: ['configOptions', productId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ConfigOption[]>>(`/v2/products/config-options?product_id=${productId}`);
      return response.data.data;
    },
    enabled: isOpen && !!productId,
  });

  // Fetch price rules
  const { data: priceRules, isLoading: isLoadingRules, refetch: refetchPriceRules } = useQuery<PriceRule[]>({
    queryKey: ['priceRules', restaurantProductId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ price_rules: PriceRule[] }>>(`/v2/products/product-price-rules?restaurant_product_id=${restaurantProductId}`);
      return response.data.data.price_rules;
    },
    enabled: isOpen && !!restaurantProductId,
  });

  // Find primary and dependent attribute IDs from config options
  useEffect(() => {
    const configOptionsData = configOptions as ConfigOption[];
    if (configOptionsData && configOptionsData.length > 0) {
      // For this implementation, we'll use the first two attributes as primary and dependent
      // In a real implementation, you might want to allow selection of which attributes to use
      if (configOptionsData[0]?.product_configuration_attributes) {
        setPrimaryAttributeId(configOptionsData[0].product_configuration_attributes.id);
      }
      
      if (configOptionsData.length > 1 && configOptionsData[1]?.product_configuration_attributes) {
        setDependentAttributeId(configOptionsData[1].product_configuration_attributes.id);
      } else if (configOptionsData.length === 1 && configOptionsData[0]?.product_configuration_attributes) {
        // If only one attribute exists, use it for both (though this is an edge case)
        setDependentAttributeId(configOptionsData[0].product_configuration_attributes.id);
      }
    }
  }, [configOptions]);

  // Fetch primary attribute values
  const { data: primaryAttributeValues, isLoading: isLoadingPrimaryValues } = useQuery<AttributeValue[]>({
    queryKey: ['attributeValues', primaryAttributeId],
    queryFn: async () => {
      if (!primaryAttributeId) return [];
      const response = await api.get<ApiResponse<AttributeValue[]>>(`/v2/products/attribute-values?attribute_id=${primaryAttributeId}`);
      return response.data.data;
    },
    enabled: isOpen && !!primaryAttributeId,
  });

  // Fetch dependent attribute values
  const { data: dependentAttributeValues, isLoading: isLoadingDependentValues } = useQuery<AttributeValue[]>({
    queryKey: ['attributeValues', dependentAttributeId],
    queryFn: async () => {
      if (!dependentAttributeId) return [];
      const response = await api.get<ApiResponse<AttributeValue[]>>(`/v2/products/attribute-values?attribute_id=${dependentAttributeId}`);
      return response.data.data;
    },
    enabled: isOpen && !!dependentAttributeId,
  });

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setNewRule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new price rule
  const handleAddPriceRule = async () => {
    if (!newRule.primary_attribute_value_id || !newRule.dependent_attribute_value_id || !newRule.price_adjustment) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        restaurant_product_id: restaurantProductId,
        price_rules: [
          {
            primary_attribute_value_id: parseInt(newRule.primary_attribute_value_id),
            dependent_attribute_value_id: parseInt(newRule.dependent_attribute_value_id),
            price_adjustment: newRule.price_adjustment,
          },
        ],
      };
      
      const response = await api.post<ApiResponse<any>>('/v2/products/product-price-rules', payload);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Price rule added successfully",
        });
        
        // Reset form
        setNewRule({
          primary_attribute_value_id: "",
          dependent_attribute_value_id: "",
          price_adjustment: "",
        });
        
        // Refetch price rules
        refetchPriceRules();
      } else {
        throw new Error("Failed to add price rule");
      }
    } catch (error) {
      console.error("Error adding price rule:", error);
      
      toast({
        title: "Error",
        description: "Failed to add price rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete price rule
  const handleDeletePriceRule = async (ruleId: number) => {
    try {
      const response = await api.delete<ApiResponse<any>>(`/v2/products/product-price-rules/${ruleId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Price rule deleted successfully",
        });
        
        // Refetch price rules
        refetchPriceRules();
      } else {
        throw new Error("Failed to delete price rule");
      }
    } catch (error) {
      console.error("Error deleting price rule:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete price rule. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get attribute name by ID
  const getAttributeName = (attributeId: number): string => {
    const configOptionsData = configOptions as ConfigOption[];
    const attribute = configOptionsData?.find(option => 
      option.product_configuration_attributes.id === attributeId
    )?.product_configuration_attributes;
    
    return attribute ? attribute.display_name : "Unknown";
  };

  // Loading state
  const isLoading = isLoadingConfig || isLoadingRules || isLoadingPrimaryValues || isLoadingDependentValues;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl">Price Adjustments</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="w-full flex justify-center p-8">Loading...</div>
          ) : (
            <>
              {/* Add new price rule form */}
              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-4">Add New Price Adjustment</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Select 
                      value={newRule.primary_attribute_value_id} 
                      onValueChange={(value) => handleInputChange("primary_attribute_value_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${primaryAttributeId ? getAttributeName(primaryAttributeId) : 'Primary Attribute'}`} />
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${dependentAttributeId ? getAttributeName(dependentAttributeId) : 'Dependent Attribute'}`} />
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
                  <div>
                    <Input
                      type="number"
                      placeholder="Price Adjustment"
                      value={newRule.price_adjustment}
                      onChange={(e) => handleInputChange("price_adjustment", e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <Button 
                      className="w-full" 
                      onClick={handleAddPriceRule}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price rules table */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Primary Attribute</TableHead>
                      <TableHead>Dependent Attribute</TableHead>
                      <TableHead>Price Adjustment</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceRules?.length > 0 ? (
                      priceRules.map((rule: PriceRule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div className="font-medium">{rule.primary_attribute.value}</div>
                            <div className="text-sm text-gray-500">{rule.primary_attribute.attribute_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{rule.dependent_attribute.value}</div>
                            <div className="text-sm text-gray-500">{rule.dependent_attribute.attribute_name}</div>
                          </TableCell>
                          <TableCell className="font-medium">${parseFloat(rule.price_adjustment).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePriceRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
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
    </Dialog>
  );
}; 