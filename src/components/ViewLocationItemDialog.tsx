import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";

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
  seq_no: number;
  status: number;
  modifier_categories: ModifierCategory;
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
}

// Categorized modifiers interface
interface CategorizedModifier {
  modifier_category_id: number;
  modifier_category: string;
  modifiers: AvailableModifier[];
}

interface ApiResponse<T> {
  data: T;
}

interface ModifierCategoriesResponse {
  modifier_categories: ModifierCategory[];
}

interface ModifiersResponse {
  modifiers: Modifier[];
}

interface RestaurantProductModifiersResponse {
  restaurant_product_modifiers: RestaurantProductModifier[];
}

interface ViewLocationItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id?: string;
    name: string;
    price: string;
    onlinePrice: string;
    discountType: string;
    discount: string;
    onlineDiscount: string;
    tags: string[];
    active: boolean;
    online: boolean;
    restrictAttributeCombinations?: boolean;
    isOfferHalfNHalf?: boolean;
    modifiers?: {
      sauceOptions: { name: string; price: string; }[];
      extras: { name: string; price: string; }[];
    };
  };
}

const ViewLocationItemDialog = ({ 
  open, 
  onOpenChange, 
  item
}: ViewLocationItemDialogProps) => {
  const [showModifiers, setShowModifiers] = useState(true);
  const [showSpinner, setShowSpinner] = useState(true);

  // Fetch modifier categories
  const { data: modifierCategoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['modifier-categories'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('per_page', '9999');
      
      const response = await api.get<ApiResponse<ModifierCategoriesResponse>>('/modifier-categories', { params });
      return response;
    },
    enabled: open
  });

  // Fetch all modifiers
  const { data: modifiersData, isLoading: isLoadingModifiers } = useQuery({
    queryKey: ['modifiers'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('per_page', '9999');
      
      const response = await api.get<ApiResponse<ModifiersResponse>>('/modifiers', { params });
      return response;
    },
    enabled: open
  });

  // Fetch restaurant product modifiers for this specific product
  const { data: restaurantProductModifiersData, isLoading: isLoadingProductModifiers } = useQuery({
    queryKey: ['restaurant-product-modifiers', item.id],
    queryFn: async () => {
      if (!item.id) return { restaurant_product_modifiers: [] };

      const params = new URLSearchParams();
      params.append('per_page', '9999');
      params.append('restaurant_product_id', item.id);

      const response = await api.get<ApiResponse<RestaurantProductModifiersResponse>>('/restaurant-product-modifiers', { params });
      console.log({ response })
      return response;
    },
    enabled: open && !!item.id
  });
  console.log({modifierCategoriesData , restaurantProductModifiersData, modifiersData})
  // Mimic Vue's availableModifiers computed property
  const availableModifiers: AvailableModifier[] = useMemo(() => {
    if (!modifiersData?.modifiers || !restaurantProductModifiersData?.restaurant_product_modifiers) {
      return [];
    }

    const availMod: AvailableModifier[] = [];
    const modifiersClone = [...modifiersData.modifiers];
    const restaurantProductModifiers = restaurantProductModifiersData.restaurant_product_modifiers;

    modifiersClone.forEach((modifier) => {
      // Find if this modifier is assigned to the current product
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
        if (item.status === 1) {
          existingCategory.modifiers.push(item);
        }
      } else {
        if (item.status === 1) {
          categories.push({
            modifier_category_id: item.modifier_category_id,
            modifier_category: item.modifier_category,
            modifiers: [item],
          });
        }
      }
    });
    
    return categories;
  }, [availableModifiers]);

  // Check if any category has modifiers (mimicking Vue's checkCount function)
  const hasActiveModifiers = categorizedModifiers.some(category => category.modifiers.length > 0);

  // Format price for display (mimicking Vue template logic)
  const formatPriceDisplay = (price: string, onlinePrice: string) => {
    const displayOnlinePrice = onlinePrice || price;
    return `$${price} / $${displayOnlinePrice}`;
  };

  const isLoading = isLoadingCategories || isLoadingModifiers || isLoadingProductModifiers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            View Location Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main fields in 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Name*:</Label>
              <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center">
                {item.name}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">Price*:</Label>
              <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center">
                ${item.price}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Online Price:</Label>
              <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center">
                ${item.onlinePrice}
              </div>
            </div>
          </div>

          {/* Discount fields in 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Discount Type:</Label>
              <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center">
                {item.discountType}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Discount:</Label>
              <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center">
                {item.discount}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">Online Discount:</Label>
              <div className="h-10 px-3 py-2 border border-input rounded-md flex items-center">
                {item.onlineDiscount}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label className="font-semibold">Tags:</Label>
            <div className="min-h-10 px-3 py-2 border border-input rounded-md flex items-center">
              {Array.isArray(item.tags) ? item.tags.join(", ") : ""}
            </div>
          </div>

          {/* Switch Fields - 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Active</Label>
              <Switch
                checked={item.active}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold">Online</Label>
              <Switch
                checked={item.online}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold">Offers Half</Label>
              <Switch
                checked={item.isOfferHalfNHalf !== undefined ? item.isOfferHalfNHalf : false}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold">Restrict Combination</Label>
              <Switch
                checked={item.restrictAttributeCombinations !== undefined ? item.restrictAttributeCombinations : false}
                disabled
              />
            </div>
          </div>

          {/* Available Modifiers Section */}
          {hasActiveModifiers && (
            <>
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Available Modifiers:</h3>

                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2">Loading modifiers...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categorizedModifiers.map((category) => (
                      <div key={category.modifier_category_id} className="space-y-2">
                        <Label className="font-semibold text-base">
                          {category.modifier_category}:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {category.modifiers
                            .sort((a, b) => a.modifier.localeCompare(b.modifier))
                            .map((modifier) => (
                              <div 
                                key={modifier.id} 
                                className="bg-background border border-primary text-primary rounded-full px-4 py-1 text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                              >
                                {modifier.modifier} - {formatPriceDisplay(modifier.price, modifier.online_price)}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLocationItemDialog;