import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { itemsApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Item, ItemFormData, ItemUpdatePayload } from "./types";
import axios from 'axios';

interface ItemDialogFooterProps {
  isViewMode: boolean;
  editingItem: Item | null;
  formData: ItemFormData;
  onOpenChange: (open: boolean) => void;
  resetForm: () => void;
  fetchItems: () => void;
  updateFormField: (field: string, value: any) => void;
}

export const ItemDialogFooter = ({
  isViewMode,
  editingItem,
  formData,
  onOpenChange,
  resetForm,
  fetchItems,
  updateFormField,
}: ItemDialogFooterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCloned, setIsCloned] = useState(false);

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

  // Upload image separately using POST /attachment API
  const uploadImage = async (itemId: number, imageFile: File) => {
    try {
      // Get the auth token
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      const formData = new FormData();
      formData.append('module_type', '2');
      formData.append('module_id', itemId.toString());
      formData.append('attachment', imageFile);
      formData.append('attachment_type', '1');

      const response = await axios.post(
        `${import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api'}/attachment`,
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta',
          }
        }
      );

      
      return response.data;
    } catch (error) {
      
      throw error;
    }
  };

  const handleClone = () => {
    if (!editingItem) return;
    
    // Update the name to indicate it's a clone
    updateFormField('name', `${formData.name}_clone`);
    setIsCloned(true);
    toast({
      title: "Item Prepared for Cloning",
      description: "Click Submit to create the clone",
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const restaurant_ids = formData.locations && formData.locations.length > 0 && 
        formData.locations[0] !== "All Locations" ? 
        formData.locations.map(id => Number(id)) : [];

      if (isCloned) {
        // For clone mode, use FormData to create new item
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('category_id', Number(formData.category_id).toString());
        formDataToSend.append('quantity', Number(formData.quantity).toString());
        formDataToSend.append('quantity_unit', Number(formData.quantity_unit_id).toString());
        formDataToSend.append('price', Number(formData.price).toString());
        formDataToSend.append('online_price', Number(formData.online_price).toString());
        formDataToSend.append('discount', Number(formData.discount).toString());
        formDataToSend.append('discount_type', Number(formData.discount_type_id).toString());
        formDataToSend.append('module_type', '2');
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
        
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
        
        await itemsApi.createItem(formDataToSend);
        toast({
          title: "Success",
          description: "Item cloned successfully",
        });
      } else if (editingItem) {
        // Check if this is a new image file (not a data URL from existing image)
        const isNewImageFile = formData.image && 
          formData.image instanceof File && 
          formData.imagePreview && 
          formData.imagePreview.startsWith('data:');

        // First, upload the image if there's a new image file
        if (isNewImageFile) {
          try {
            await uploadImage(editingItem.id, formData.image);
            toast({
              title: "Image Uploaded",
              description: "Image uploaded successfully",
            });
          } catch (error) {
            
            toast({
              title: "Warning",
              description: "Image upload failed, but item will still be updated",
              variant: "destructive",
            });
          }
        }

        // Then update the product data (without image since it's handled separately)
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

        await itemsApi.updateItem(editingItem.id, updateData);
        
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        // For create mode, use the existing FormData approach
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
        
        if (formData.image) {
          formDataToSend.append('image', formData.image);
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
      
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsCloned(false);
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
      {!isViewMode && editingItem && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleClone}
          disabled={isLoading}
        >
          {isCloned ? "Cloned" : "Clone"}
        </Button>
      )}
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
