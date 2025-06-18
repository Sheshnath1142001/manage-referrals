import { useState, useEffect, useMemo } from "react";
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
// Table components inline since @/components/ui/table is not available
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { locationItemsApi } from "@/services/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { UpdateModifierDialog } from "./modifiers/UpdateModifierDialog";

// Define interfaces
interface ModifierCategory {
  id: number;
  modifier_category: string;
  is_mandatory: number;
  is_single_select: number;
  status: number;
  min?: number | null;
  max?: number | null;
  seq_no: number;
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

// Available modifier interface (mimicking Vue's availableModifiers computed property)
interface AvailableModifier {
  id: string;
  modifier_category_id: number;
  modifier_category: string;
  modifier: string;
  modifier_id: number;
  price: string;
  status: number;
  online_price: string;
  half_price: string | null;
  online_half_price: string | null;
}

// Categorized modifiers interface
interface CategorizedModifier {
  modifier_category_id: number;
  modifier_category: string;
  modifiers: AvailableModifier[];
}

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

export const BulkEditModifiersDialog = ({
  isOpen,
  onOpenChange,
  selectedItems,
  onBulkUpdateSuccess,
}: BulkEditModifiersDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toggleMod, setToggleMod] = useState(true); // Vue's toggleMod equivalent
  const [showSpinner, setShowSpinner] = useState(true);

  // State for update modifier dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState<any | null>(null);

  // Fetch modifier categories
  const { data: modifierCategoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['modifier-categories'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('per_page', '9999');
      params.append('with_pre_defines', '1');
      
      const response = await api.get('/modifier-categories', { params });
      return response; // Direct access to response.data
    },
    enabled: isOpen
  });

  // Fetch all modifiers
  const { data: modifiersData, isLoading: isLoadingModifiers } = useQuery({
    queryKey: ['modifiers'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('per_page', '9999');
      params.append('with_pre_defines', '1');
      
      const response = await api.get('/modifiers', { params });
      return response; // Direct access to response.data
    },
    enabled: isOpen
  });

  // Fetch existing modifiers for selected items
  const { data: restaurantProductModifiersData, isLoading: isLoadingProductModifiers } = useQuery({
    queryKey: ['restaurant-product-modifiers', selectedItems.map(item => item.id)],
    queryFn: async () => {
      if (selectedItems.length === 0) return { restaurant_product_modifiers: [] };

      const params = new URLSearchParams();
      params.append('per_page', '9999');
      
      selectedItems.forEach(item => {
        params.append('restaurant_product_id[]', item.id);
      });

      const response = await api.get('/restaurant-product-modifiers', { params });
      return response; // Direct access to response.data
    },
    enabled: isOpen && selectedItems.length > 0
  });

  // Simulate the Vue showModifiersWithDelay function
  useEffect(() => {
    if (isOpen) {
      setShowSpinner(true);
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Mimic Vue's availableModifiers computed property
  const availableModifiers: AvailableModifier[] = useMemo(() => {
    if (!modifiersData?.modifiers || !restaurantProductModifiersData?.restaurant_product_modifiers) {
      return [];
    }

    const availMod: AvailableModifier[] = [];
    const modifiersClone = [...modifiersData.modifiers];
    const restaurantProductModifiers = restaurantProductModifiersData.restaurant_product_modifiers;

    modifiersClone.forEach((modifier) => {
      // Find if this modifier is assigned to any of the selected products
      const productModifier = restaurantProductModifiers.find(
        (pm) => pm.modifier_id === modifier.id
      );

      if (productModifier) {
        const obj: AvailableModifier = {
          id: productModifier.id,
          modifier_category_id: productModifier.modifiers.modifier_categories.id,
          modifier_category: productModifier.modifiers.modifier_categories.modifier_category,
          modifier: modifier.modifier,
          modifier_id: modifier.id,
          price: productModifier.price,
          status: productModifier.status,
          online_price: productModifier.online_price,
          half_price: productModifier.half_price,
          online_half_price: productModifier.online_half_price,
        };
        availMod.push(obj);
      }
    });

    return availMod;
  }, [modifiersData, restaurantProductModifiersData]);

  // Mimic Vue's categorizedModifiers computed property
  const categorizedModifiers: CategorizedModifier[] = useMemo(() => {
    const categories: CategorizedModifier[] = [];
    
    availableModifiers.forEach((item) => {
      const existingCategory = categories.find(
        (category) => category.modifier_category_id === item.modifier_category_id
      );
      
      if (existingCategory) {
        existingCategory.modifiers.push(item);
      } else {
        categories.push({
          modifier_category_id: item.modifier_category_id,
          modifier_category: item.modifier_category,
          modifiers: [item],
        });
      }
    });
    
    return categories;
  }, [availableModifiers]);

  // Check count function (mimicking Vue's checkCount)
  const checkCount = (modifiers: AvailableModifier[]) => {
    let added = 0, notAdded = 0;
    for (const mod of modifiers) {
      if (mod.status === 1) {
        added = 1;
      } else {
        notAdded = 1;
      }
    }
    return { added, notAdded };
  };

  // Add modifiers form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedModifierId, setSelectedModifierId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [onlinePrice, setOnlinePrice] = useState("");
  
  // Selected modifiers state (modifiersLocalList equivalent)
  const [modifiersLocalList, setModifiersLocalList] = useState<Array<{
    modifier_category_id: number;
    modifier_category: string;
    modifier: string;
    modifier_id: number;
    price: string;
    online_price: string;
    half_price: string | null;
    online_half_price: string | null;
  }>>([]);

  // Fetch modifiers for the selected category
  const { data: categoryModifiersData, isLoading: isLoadingCategoryModifiers } = useQuery({
    queryKey: ['category-modifiers', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return { modifiers: [] };
      
      const response = await api.get('/modifiers', { 
        params: {
          per_page: 9999,
          modifier_category_id: selectedCategoryId,
          with_pre_defines: 1
        }
      });
      // Return the response directly since it should contain the modifiers array
      return response;
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
      setModifiersLocalList([]);
      setToggleMod(true);
    }
  }, [isOpen]);

  // Reset modifier selection when category changes
  useEffect(() => {
    setSelectedModifierId("");
    setPrice("");
    setOnlinePrice("");
  }, [selectedCategoryId]);

  // Get category-specific modifiers
  const categoryModifiers = categoryModifiersData?.modifiers || categoryModifiersData?.data?.modifiers || [];

  // Get available category options from modifierCategoriesData
  const modifierCategories = modifierCategoriesData?.modifier_categories || [];

  // Debug logging for modifier data
  
  
  
  
  

  // Format price for display (mimicking Vue template logic)
  const formatPriceDisplay = (price: string, onlinePrice: string) => {
    const displayOnlinePrice = onlinePrice || price;
    return `(P- $${price} / $${displayOnlinePrice})`;
  };

  // Handle adding a modifier to the selected list (mimicking Vue's addModifierToList)
  const handleAddModifier = () => {
    if (!selectedCategoryId || !selectedModifierId || !price) {
      toast({
        title: "Validation Error",
        description: "Enter complete information!",
        variant: "destructive"
      });
      return;
    }

    const selectedCategory = modifierCategories.find(cat => cat.id === parseInt(selectedCategoryId));
    const modifier = categoryModifiers.find(mod => mod.id === parseInt(selectedModifierId));
    
    if (!modifier || !selectedCategory) return;

    // Check if modifier is already in the list
    if (modifiersLocalList.some(md => md.modifier_id === modifier.id)) {
      toast({
        title: "Warning",
        description: "Modifier is already added in the list!",
        variant: "destructive"
      });
      return;
    }

    const newModifier = {
      modifier_category_id: selectedCategory.id,
      modifier_category: selectedCategory.modifier_category,
      modifier: modifier.modifier,
      modifier_id: modifier.id,
      price: price,
      online_price: onlinePrice || price,
      half_price: null,
      online_half_price: null
    };

    setModifiersLocalList(prev => [...prev, newModifier]);

    // Reset form fields after adding
    setSelectedModifierId("");
    setPrice("");
    setOnlinePrice("");
  };

  // Remove from list function
  const removeFromList = (item: any) => {
    setModifiersLocalList(prev => 
      prev.filter(mod => mod.modifier_id !== item.modifier_id)
    );
  };

  // Submit bulk changes (mimicking Vue's onSubmit)
  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (modifiersLocalList.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one modifier",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      const restaurantProductModifiers: any[] = [];
      
      // Create modifiers for each selected item
      selectedItems.forEach(item => {
        modifiersLocalList.forEach(mod => {
          restaurantProductModifiers.push({
            restaurant_product_id: parseInt(item.id),
            modifier_id: mod.modifier_id,
            price: parseFloat(mod.price),
            online_price: parseFloat(mod.online_price),
            half_price: mod.half_price ? parseFloat(mod.half_price) : null,
            online_half_price: mod.online_half_price ? parseFloat(mod.online_half_price) : null
          });
        });
      });
      
      // Make the API call
      await locationItemsApi.createMultipleRestaurantProductModifiers(restaurantProductModifiers);
      
      // Show success message
      toast({
        title: "Success",
        description: `Added modifiers successfully`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['locationItems'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-product-modifiers'] });
      
      // Close dialog and notify parent
      onOpenChange(false);
      onBulkUpdateSuccess();
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update modifiers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingCategories || isLoadingModifiers || isLoadingProductModifiers;

  const handleModifierClick = (modifier: any) => {
    setSelectedModifier(modifier);
    setUpdateDialogOpen(true);
  };

  const handleUpdateModifier = async (data: { price: string; online_price: string; status: number }) => {
    try {
      // Update the modifier in the database using the correct endpoint
      const response = await api.patch(`/restaurant-product-modifier/${selectedModifier.id}`, {
        price: Number(data.price),
        online_price: Number(data.online_price),
        status: data.status
      });

      // Show success message using the API response message
      toast({
        title: "Success",
        description: response.message || "Modifier updated successfully"
      });

      // Refresh the data
      queryClient.invalidateQueries(['restaurant-product-modifiers']);

      // Close the update dialog
      setUpdateDialogOpen(false);
      setSelectedModifier(null);
    } catch (error) {
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update modifier",
        variant: "destructive"
      });
    }
  };

  return (
    <>
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
            {/* Available Modifiers Section */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Available Modifiers</h3>
              <Switch 
                checked={toggleMod} 
                onCheckedChange={setToggleMod}
                className="data-[state=checked]:bg-black"
              />
            </div>

            {/* Display existing modifiers grouped by category (mimicking Vue's categorizedModifiers display) */}
            {showSpinner || isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2">Loading modifiers...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categorizedModifiers.length === 0 ? (
                  <div className="text-gray-500 italic">No modifier is associated with the item!</div>
                ) : (
                  categorizedModifiers.map((category) => {
                    const filteredModifiers = toggleMod 
                      ? category.modifiers.filter(mod => mod.status === 1)
                      : category.modifiers.filter(mod => mod.status === 0);
                    
                    const countResult = checkCount(category.modifiers);
                    const showCategory = toggleMod ? countResult.added === 1 : countResult.notAdded === 1;
                    
                    if (filteredModifiers.length === 0 || !showCategory) return null;
                    
                    return (
                      <div key={category.modifier_category_id} className="space-y-2">
                        <Label className="font-semibold text-base">
                          {category.modifier_category}:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {filteredModifiers
                            .sort((a, b) => a.modifier.localeCompare(b.modifier))
                            .map((modifier) => (
                              <div 
                                key={modifier.id} 
                                className={`border rounded-full px-4 py-1 text-sm cursor-pointer transition-colors ${
                                  modifier.status === 1 
                                    ? 'bg-white border-black text-black hover:bg-gray-100' 
                                    : 'bg-white border-red-500 text-red-500 hover:bg-red-50'
                                }`}
                                onClick={() => handleModifierClick(modifier)}
                              >
                                {modifier.modifier.toLowerCase() !== 'misc' ? (
                                  <span>
                                    {modifier.modifier} {formatPriceDisplay(modifier.price, modifier.online_price)}
                                  </span>
                                ) : (
                                  <span>{modifier.modifier}</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })
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
                    {modifierCategories
                      .filter(cat => cat.status === 1)
                      .map((category) => (
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
                  value={selectedModifierId} 
                  onValueChange={setSelectedModifierId}
                  disabled={!selectedCategoryId || isLoadingCategoryModifiers}
                >
                  <SelectTrigger id="modifier" className="mt-1">
                    <SelectValue placeholder={isLoadingCategoryModifiers ? "Loading modifiers..." : "Select modifier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryModifiers
                      .filter(mod => mod.status === 1)
                      .map((modifier) => (
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

            {/* Display selected modifiers (modifiersLocalList) */}
            {modifiersLocalList.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Selected Modifiers</h3>
                <div className="flex flex-wrap gap-2">
                  {modifiersLocalList.map((mod, index) => (
                    <div 
                      key={index} 
                      className="bg-black text-white rounded-full px-4 py-1 text-sm flex items-center gap-2"
                    >
                      {mod.modifier.toLowerCase() !== 'misc' ? (
                        <span>
                          {mod.modifier} {formatPriceDisplay(mod.price, mod.online_price)}
                        </span>
                      ) : (
                        <span>{mod.modifier}</span>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromList(mod);
                        }}
                        className="text-white hover:text-gray-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
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
                  <div className="min-w-full">
                    <div className="bg-gray-50 border-b">
                      <div className="grid grid-cols-2 gap-4 px-4 py-2 font-medium">
                        <div>ID</div>
                        <div>Item Name</div>
                      </div>
                    </div>
                    <div>
                      {selectedItems.map((item) => (
                        <div key={item.id} className="border-b last:border-b-0">
                          <div className="grid grid-cols-2 gap-4 px-4 py-2">
                            <div>{item.id}</div>
                            <div className="font-medium">{item.products.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                disabled={isSubmitting || modifiersLocalList.length === 0}
              >
                {isSubmitting ? "SAVING..." : "ADD MODIFIERS"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Modifier Dialog */}
      {selectedModifier && (
        <UpdateModifierDialog
          isOpen={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          modifier={selectedModifier}
          onSubmit={handleUpdateModifier}
        />
      )}
    </>
  );
};