import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { locationItemsApi } from "@/services/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";

// Define interface for ModifierCategory
interface ModifierCategory {
  id: number;
  modifier_category: string;
  is_mandatory: number;
  is_single_select: number;
  status: number;
  min?: number | null;
  max?: number | null;
}

// Define interface for Modifier
interface Modifier {
  id: number;
  modifier: string;
  modifier_category_id: number;
  modifier_categories: ModifierCategory;
  status: number;
  seq_no: number;
}

// Define interface for RestaurantProductModifier
interface RestaurantProductModifier {
  id: string;
  restaurant_product_id: string;
  price: string;
  online_price: string;
  half_price: string | null;
  online_half_price: string | null;
  status: number;
  modifier_id: number;
  modifiers: {
    id: number;
    modifier: string;
    modifier_category_id: number;
    seq_no: number;
    modifier_categories: ModifierCategory;
    status: number;
  };
  restaurant_products: {
    id: string;
    products: {
      id: number;
      name: string;
    };
  };
}

// Define interface for GroupedModifiers
interface GroupedModifiers {
  [key: string]: {
    categoryId: number,
    modifiers: Modifier[]
  };
}

// Define interface for existing modifiers grouped by category
interface GroupedExistingModifiers {
  [key: string]: {
    categoryId: number,
    modifiers: RestaurantProductModifier[]
  };
}

// Define interface for LocationItem
interface LocationItem {
  id: string;
  product_id: number;
  products: {
    id: number;
    name: string;
    description: string | null;
  };
}

interface BulkEditModifiersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: LocationItem[];
  onBulkUpdateSuccess: () => void;
}

interface ApiResponse<T> {
  data: T;
}

interface ModifiersResponse {
  modifiers: Modifier[];
}

interface RestaurantProductModifiersResponse {
  restaurant_product_modifiers: RestaurantProductModifier[];
}

export const BulkEditModifiersDialog = ({
  isOpen,
  onOpenChange,
  selectedItems,
  onBulkUpdateSuccess,
}: BulkEditModifiersDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableModifiers, setAvailableModifiers] = useState(true);

  // Fetch existing modifiers for selected items
  const { data: existingModifiersData, isLoading: isLoadingExistingModifiers } = useQuery<RestaurantProductModifiersResponse>({
    queryKey: ['restaurant-product-modifiers', selectedItems.map(item => item.id)],
    queryFn: async () => {
      if (selectedItems.length === 0) return { restaurant_product_modifiers: [] };

      const params = new URLSearchParams();
      params.append('per_page', '9999');
      
      selectedItems.forEach(item => {
        params.append('restaurant_product_id[]', item.id);
      });

      const response = await api.get<ApiResponse<RestaurantProductModifiersResponse>>('/restaurant-product-modifiers', { params });
      return response.data.data;
    },
    enabled: isOpen && selectedItems.length > 0
  });

  // Group existing modifiers by category
  const groupedExistingModifiers: GroupedExistingModifiers = existingModifiersData?.restaurant_product_modifiers
    ? existingModifiersData.restaurant_product_modifiers.reduce((acc, modifier) => {
        const categoryName = modifier.modifiers.modifier_categories.modifier_category;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            categoryId: modifier.modifiers.modifier_categories.id,
            modifiers: []
          };
        }
        acc[categoryName].modifiers.push(modifier);
        return acc;
      }, {} as GroupedExistingModifiers)
    : {};

  // Fetch all modifiers
  const { data: modifiersData, isLoading: isLoadingModifiers } = useQuery<ModifiersResponse>({
    queryKey: ['modifiers'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ModifiersResponse>>('/modifiers', { 
        params: {
          per_page: 9999,
          with_pre_defines: 1
        }
      });
      return response.data.data;
    },
    enabled: isOpen
  });

  // Group modifiers by category
  const groupedModifiers: GroupedModifiers = modifiersData?.modifiers
    ? modifiersData.modifiers.reduce((acc, modifier) => {
        const categoryName = modifier.modifier_categories.modifier_category;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            categoryId: modifier.modifier_categories.id,
            modifiers: []
          };
        }
        acc[categoryName].modifiers.push(modifier);
        return acc;
      }, {} as GroupedModifiers)
    : {};

  // Add modifiers form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedModifierId, setSelectedModifierId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [onlinePrice, setOnlinePrice] = useState("");
  
  // Selected modifiers state
  const [selectedModifiers, setSelectedModifiers] = useState<Array<{
    categoryId: number;
    modifierId: number;
    name: string;
    price: string;
    onlinePrice: string;
  }>>([]);

  // Fetch modifiers for the selected category
  const { data: categoryModifiersData, isLoading: isLoadingCategoryModifiers } = useQuery<ModifiersResponse>({
    queryKey: ['category-modifiers', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return { modifiers: [] };
      
      const response = await api.get<ApiResponse<ModifiersResponse>>('/modifiers', { 
        params: {
          per_page: 9999,
          modifier_category_id: selectedCategoryId,
          with_pre_defines: 1
        }
      });
      return response.data.data;
    },
    enabled: !!selectedCategoryId
  });

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId("");
      setSelectedModifierId("");
      setPrice("");
      setOnlinePrice("");
      setSelectedModifiers([]);
      setAvailableModifiers(true);
    }
  }, [isOpen]);

  // Reset modifier selection when category changes
  useEffect(() => {
    setSelectedModifierId("");
  }, [selectedCategoryId]);

  // Filter modifiers by the selected category
  const filteredModifiers = modifiersData?.modifiers
    ? modifiersData.modifiers.filter(mod => 
        selectedCategoryId ? mod.modifier_category_id === parseInt(selectedCategoryId) : false
      )
    : [];

  // Get category-specific modifiers
  const categoryModifiers = categoryModifiersData?.modifiers || [];

  // Handle adding a modifier to the selected list
  const handleAddModifier = () => {
    if (!selectedCategoryId || !selectedModifierId || !price) {
      toast({
        title: "Validation Error",
        description: "Please select a category, modifier, and enter a price",
        variant: "destructive"
      });
      return;
    }

    const modifier = categoryModifiers.find(mod => mod.id === parseInt(selectedModifierId));
    
    if (!modifier) return;

    setSelectedModifiers(prev => [
      ...prev,
      {
        categoryId: parseInt(selectedCategoryId),
        modifierId: parseInt(selectedModifierId),
        name: modifier.modifier,
        price,
        onlinePrice: onlinePrice || price
      }
    ]);

    // Reset form fields after adding
    setSelectedModifierId("");
    setPrice("");
    setOnlinePrice("");
  };

  // Format price for display
  const formatPriceDisplay = (price: string, onlinePrice: string) => {
    return `(P- $${price} / $${onlinePrice || price})`;
  };

  // Submit bulk changes
  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (selectedModifiers.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one modifier",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create a set of existing modifier identifiers to avoid duplicates
      // Format: "restaurant_product_id-modifier_id"
      const existingModifierIdentifiers = new Set();
      
      // Populate the set with existing modifiers
      if (existingModifiersData?.restaurant_product_modifiers) {
        existingModifiersData.restaurant_product_modifiers.forEach(mod => {
          const identifier = `${mod.restaurant_product_id}-${mod.modifier_id}`;
          existingModifierIdentifiers.add(identifier);
        });
      }
      
      // Filter out modifiers that already exist
      const modifiersToAdd = [];
      
      // Create modifiers array, skipping any that already exist
      selectedItems.forEach(item => {
        selectedModifiers.forEach(mod => {
          const identifier = `${Number(item.id)}-${Number(mod.modifierId)}`;
          
          // Only add if it doesn't already exist
          if (!existingModifierIdentifiers.has(identifier)) {
            modifiersToAdd.push({
              restaurant_product_id: Number(item.id),
              modifier_id: Number(mod.modifierId),
              price: parseFloat(mod.price),
              online_price: parseFloat(mod.onlinePrice || mod.price),
              half_price: null,
              online_half_price: null,
              status: 1
            });
          }
        });
      });
      
      // If nothing to add after filtering, show a message and return
      if (modifiersToAdd.length === 0) {
        toast({
          title: "Information",
          description: "These modifiers already exist for the selected items. No changes made.",
        });
        setIsSubmitting(false);
        onOpenChange(false);
        return;
      }
      
      // Make the API call to create multiple restaurant product modifiers
      await locationItemsApi.createMultipleRestaurantProductModifiers(modifiersToAdd);
      
      // Show success message
      toast({
        title: "Success",
        description: `Added ${modifiersToAdd.length} modifiers successfully`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['locationItems'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-product-modifiers'] });
      
      // Close dialog and notify parent
      onOpenChange(false);
      onBulkUpdateSuccess();
    } catch (error) {
      console.error("Error updating items:", error);
      
      // Handle unique constraint violation (P2002)
      if (error.response?.data?.error?.code === "P2002") {
        toast({
          title: "Duplicate Error",
          description: "Some modifiers are already assigned to these items.",
          variant: "destructive"
        });
      } 
      // Handle validation errors
      else if (error.response?.data) {
        const validationErrors = error.response.data;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          // Display the first validation error
          toast({
            title: "Validation Error",
            description: validationErrors[0].message || "Invalid data submitted",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update modifiers. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update modifiers. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-black text-white p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              {selectedItems.length === 1 
                ? `Add Modifiers: ${selectedItems[0].products.name}` 
                : `Bulk Modifier Edit (${selectedItems.length} items)`}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto flex-1" style={{ paddingBottom: "calc(4rem + 1px)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Available Modifiers</h3>
            <Switch 
              checked={availableModifiers} 
              onCheckedChange={setAvailableModifiers}
              className="data-[state=checked]:bg-black"
            />
          </div>

          {/* Display existing modifiers grouped by category */}
          {availableModifiers && (
            <div className="space-y-6">
              {isLoadingExistingModifiers ? (
                <div className="text-center py-4">Loading modifiers...</div>
              ) : Object.keys(groupedExistingModifiers).length === 0 ? (
                <div className="text-gray-500 italic">No modifiers assigned to selected items</div>
              ) : (
                Object.entries(groupedExistingModifiers).map(([categoryName, { modifiers }]) => (
                  <div key={categoryName} className="space-y-2">
                    <Label className="font-semibold text-base">
                      {categoryName}:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {modifiers.map((modifier) => (
                        <div 
                          key={modifier.id} 
                          className="bg-white border border-black text-black rounded-full px-4 py-1 text-sm"
                        >
                          {modifier.modifiers.modifier} {formatPriceDisplay(modifier.price, modifier.online_price)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <Separator className="my-6" />

          <h3 className="text-xl font-semibold">Add Modifiers</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modifier-category" className="text-sm font-medium">
                Modifier Category*
              </Label>
              <Select 
                value={selectedCategoryId} 
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger id="modifier-category" className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedModifiers).map(([categoryName, { categoryId }]) => (
                    <SelectItem key={categoryId} value={categoryId.toString()}>
                      {categoryName}
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
                value={selectedModifierId} 
                onValueChange={setSelectedModifierId}
                disabled={!selectedCategoryId || isLoadingCategoryModifiers}
              >
                <SelectTrigger id="modifier" className="mt-1">
                  <SelectValue placeholder={isLoadingCategoryModifiers ? "Loading modifiers..." : "Select modifier"} />
                </SelectTrigger>
                <SelectContent>
                  {categoryModifiers.map((modifier) => (
                    <SelectItem key={modifier.id} value={modifier.id.toString()}>
                      {modifier.modifier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                Price*
              </Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="online-price" className="text-sm font-medium">
                Online Price
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="online-price"
                  value={onlinePrice}
                  onChange={(e) => setOnlinePrice(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 flex-1"
                />
                <Button
                  type="button"
                  className="mt-1 bg-black hover:bg-black/80 text-white h-10 w-10"
                  onClick={handleAddModifier}
                  disabled={!selectedCategoryId || !selectedModifierId || !price}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Display selected modifiers */}
          {selectedModifiers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Selected Modifiers</h3>
              <div className="flex flex-wrap gap-2">
                {selectedModifiers.map((mod, index) => (
                  <div 
                    key={index} 
                    className="bg-white border border-black text-black rounded-full px-4 py-1 text-sm"
                  >
                    {mod.name} {formatPriceDisplay(mod.price, mod.onlinePrice)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Display selected items */}
          {selectedItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Selected Items ({selectedItems.length})</h3>
              <div className="border rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Item Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.products.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center w-full">
            <Button
              type="button"
              className="bg-black hover:bg-black/80 text-white px-8 py-2 rounded-md"
              onClick={handleBulkSubmit}
              disabled={isSubmitting || selectedModifiers.length === 0}
            >
              {isSubmitting 
                ? "SAVING..." 
                : selectedItems.length === 1 
                  ? "ADD TO ITEM" // This matches the API endpoint's purpose
                  : "ADD TO SELECTED ITEMS"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 