
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { itemsApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Item, ItemFormData, ItemUpdatePayload } from "./types";

interface ItemDialogFooterProps {
  isViewMode: boolean;
  editingItem: Item | null;
  formData: ItemFormData;
  onOpenChange: (open: boolean) => void;
  resetForm: () => void;
  fetchItems: () => void;
}

export const ItemDialogFooter = ({
  isViewMode,
  editingItem,
  formData,
  onOpenChange,
  resetForm,
  fetchItems,
}: ItemDialogFooterProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Validate required fields
  const isFormValid = () => {
    return (
      formData.name?.trim() &&
      formData.category_id &&
      formData.quantity &&
      formData.quantity_unit_id &&
      formData.price &&
      formData.discount_type_id !== null &&
      formData.status !== null
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const restaurant_ids = formData.locations && formData.locations.length > 0 && 
        formData.locations[0] !== "All Locations" ? 
        formData.locations.map(id => Number(id)) : [];

      if (editingItem) {
        // Match the payload structure exactly as expected by the API
        const updateData: Omit<ItemUpdatePayload, 'module_type'> & { restaurant_ids?: number[] } = {
          name: formData.name,
          category_id: Number(formData.category_id),
          quantity: Number(formData.quantity),
          quantity_unit: Number(formData.quantity_unit_id),
          barcode: formData.barcode || null,
          description: formData.description || null,
          price: Number(formData.price),
          online_price: Number(formData.online_price),
          discount: Number(formData.discount),
          discount_type: Number(formData.discount_type_id),
          online_discount: Number(formData.online_discount),
          status: Number(formData.status),
          is_offer_half_n_half: 0
        };
        
        if (restaurant_ids.length > 0) {
          updateData.restaurant_ids = restaurant_ids;
        }

        if (formData.image) {
          const formDataToSend = new FormData();
          Object.entries(updateData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (key === 'restaurant_ids' && Array.isArray(value)) {
                value.forEach(id => {
                  formDataToSend.append('restaurant_ids[]', id.toString());
                });
              } else {
                formDataToSend.append(key, value.toString());
              }
            }
          });
          formDataToSend.append('image', formData.image);
          
          await itemsApi.updateItem(editingItem.id, formDataToSend);
        } else {
          await itemsApi.updateItem(editingItem.id, updateData);
        }
        
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('category_id', Number(formData.category_id).toString());
        formDataToSend.append('quantity', Number(formData.quantity).toString());
        formDataToSend.append('quantity_unit', Number(formData.quantity_unit_id).toString());
        formDataToSend.append('price', Number(formData.price).toString());
        formDataToSend.append('online_price', Number(formData.online_price).toString());
        formDataToSend.append('discount', Number(formData.discount).toString());
        formDataToSend.append('discount_type', Number(formData.discount_type_id).toString());
        formDataToSend.append('module_type', '2'); // Fixed value set to 2
        formDataToSend.append('online_discount', Number(formData.online_discount).toString());
        formDataToSend.append('status', Number(formData.status).toString());
        formDataToSend.append('is_offer_half_n_half', '0');
        
        if (formData.barcode) {
          formDataToSend.append('barcode', formData.barcode);
        } else {
          formDataToSend.append('barcode', 'null');
        }
        
        if (formData.description) {
          formDataToSend.append('description', formData.description);
        } else {
          formDataToSend.append('description', 'null');
        }
        
        if (restaurant_ids.length > 0) {
          restaurant_ids.forEach(id => {
            formDataToSend.append('restaurant_ids[]', id.toString());
          });
        }
        
        // ✅ Fixed: Use 'image' key instead of 'attachment'
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
        
        console.log('FormData contents for create:');
        for (let [key, value] of formDataToSend.entries()) {
          console.log(key, value);
        }
        
        await itemsApi.createItem(formDataToSend);
        toast({
          title: "Success",
          description: "Item created successfully",
        });
      }
      
      fetchItems();
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogFooter className="flex justify-end gap-4 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={resetForm}
        disabled={isViewMode || isLoading}
      >
        Reset
      </Button>
      {!isViewMode && (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? "Saving..." : "Submit"}
        </Button>
      )}
    </DialogFooter>
  );
};
