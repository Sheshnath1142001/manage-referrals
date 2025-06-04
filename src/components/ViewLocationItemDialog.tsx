import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
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

// Define interface for grouped modifiers
interface GroupedExistingModifiers {
  [key: string]: {
    categoryId: number,
    modifiers: RestaurantProductModifier[]
  };
}

interface ApiResponse<T> {
  data: T;
}

interface RestaurantProductModifiersResponse {
  restaurant_product_modifiers: RestaurantProductModifier[];
}

interface ViewLocationItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id?: string; // Added id field for API call
    name: string;
    price: string;
    onlinePrice: string;
    discountType: string;
    discount: string;
    onlineDiscount: string;
    tags: string[];
    active: boolean;
    online: boolean;
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

  // Fetch modifiers if item has an ID
  const { data: modifiersData, isLoading: isLoadingModifiers } = useQuery({
    queryKey: ['restaurant-product-modifiers', item.id],
    queryFn: async () => {
      if (!item.id) return { restaurant_product_modifiers: [] };

      const params = new URLSearchParams();
      params.append('per_page', '9999');
      params.append('restaurant_product_id[]', item.id);

      const response = await api.get<ApiResponse<RestaurantProductModifiersResponse>>('/restaurant-product-modifiers', { params });
      return response.data.data;
    },
    enabled: open && !!item.id
  });

  // Group modifiers by category
  const groupedModifiers: GroupedExistingModifiers = (modifiersData as RestaurantProductModifiersResponse)?.restaurant_product_modifiers
    ? (modifiersData as RestaurantProductModifiersResponse).restaurant_product_modifiers.reduce((acc, modifier) => {
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

  // Format price for display
  const formatPriceDisplay = (price: string, onlinePrice: string) => {
    return `(P- $${price} / $${onlinePrice || price})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="bg-black text-white p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">View Location Item</DialogTitle>
            <DialogClose className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Name:</Label>
              <p className="mt-1">{item.name}</p>
            </div>
            
            <div>
              <Label className="font-semibold">Price:</Label>
              <p className="mt-1">{item.price}</p>
            </div>
            
            <div>
              <Label className="font-semibold">Online Price:</Label>
              <p className="mt-1">{item.onlinePrice}</p>
            </div>

            <div>
              <Label className="font-semibold">Discount Type:</Label>
              <p className="mt-1">{item.discountType}</p>
            </div>
            
            <div>
              <Label className="font-semibold">Discount:</Label>
              <p className="mt-1">{item.discount}</p>
            </div>
            
            <div>
              <Label className="font-semibold">Online Discount:</Label>
              <p className="mt-1">{item.onlineDiscount}</p>
            </div>
            
            <div>
              <Label className="font-semibold">Status:</Label>
              <p className="mt-1">{item.active ? "Active" : "Inactive"}</p>
            </div>
            
            <div>
              <Label className="font-semibold">Availability:</Label>
              <p className="mt-1">{item.online ? "Online" : "In Store only"}</p>
            </div>
            
            <div className="md:col-span-2">
              <Label className="font-semibold">Tags:</Label>
              <p className="mt-1">{Array.isArray(item.tags) ? item.tags.join(", ") : ""}</p>
            </div>
          </div>

          {/* Available Modifiers Section - API Based */}
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Available Modifiers</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{showModifiers ? "Hide" : "Show"}</span>
                <div 
                  className={`w-10 h-5 rounded-full transition-colors cursor-pointer flex items-center ${showModifiers ? 'bg-black' : 'bg-gray-300'}`}
                  onClick={() => setShowModifiers(!showModifiers)}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${showModifiers ? 'translate-x-5' : 'translate-x-1'}`}></div>
                </div>
              </div>
            </div>

            {showModifiers && (
              <>
                {isLoadingModifiers ? (
                  <div className="text-center py-4">Loading modifiers...</div>
                ) : item.id && Object.keys(groupedModifiers).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedModifiers).map(([categoryName, { modifiers }]) => (
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
                    ))}
                  </div>
                ) : (
                  // Fallback to original modifiers display if no API data available
                  <>
                    {item.modifiers && (item.modifiers.sauceOptions?.length > 0 || item.modifiers.extras?.length > 0) ? (
                      <div className="space-y-4">
                        {item.modifiers.sauceOptions?.length > 0 && (
                          <div>
                            <h4 className="font-semibold">Extra Sauces:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.modifiers.sauceOptions.map((sauce, idx) => (
                                <div 
                                  key={idx} 
                                  className="bg-white border border-black text-black rounded-full px-4 py-1 text-sm"
                                >
                                  {sauce.name} - {sauce.price}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.modifiers.extras?.length > 0 && (
                          <div>
                            <h4 className="font-semibold">Extra Toppings:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.modifiers.extras.map((extra, idx) => (
                                <div 
                                  key={idx} 
                                  className="bg-white border border-black text-black rounded-full px-4 py-1 text-sm"
                                >
                                  {extra.name} - {extra.price}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No modifiers available</div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLocationItemDialog;
