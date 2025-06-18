import { useState, useEffect } from "react";
import { Item, ItemFormData } from "@/components/items/types";
import { attachmentsApi } from "@/services/api/attachments";

const defaultFormData: ItemFormData = {
  name: "",
  category_id: 0,
  quantity: "",
  quantity_unit_id: 0,
  barcode: "",
  price: "",
  module_type: 2,
  online_price: "",
  locations: [],
  discount_type_id: 0, // Updated from discount_type to discount_type_id
  discount: "",
  online_discount: "",
  description: "",
  image: null,
  imagePreview: "",
  imageToken: "",
  status: 1
};

export function useItemForm() {
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = (locations?: Array<{id: number, name: string, status: number}>, categories?: Array<{id: number, category: string}>) => {
    let defaultLocationIds: string[] = [];
    if (locations && locations.length > 0) {
      const firstActiveLocation = locations.find(location => location.status === 1);
      if (firstActiveLocation) {
        defaultLocationIds = [firstActiveLocation.id.toString()];
      }
    }

    // Set default category if available
    let defaultCategoryId = 0;
    if (categories && categories.length > 0) {
      defaultCategoryId = categories[0].id;
    }
    
    setFormData({
      ...defaultFormData,
      locations: defaultLocationIds,
      category_id: defaultCategoryId
    });
    // setIsItemDialogOpen(false);
    setEditingItem(null);
    setIsViewMode(false);
  };

  // Function to set default location when creating new item
  const setDefaultLocation = (locations: Array<{id: number, name: string, status: number}>) => {
    // Only set default location for new items (not when editing existing items)
    if (!editingItem && locations.length > 0 && formData.locations.length === 0) {
      const firstActiveLocation = locations.find(location => location.status === 1);
      if (firstActiveLocation) {
        updateFormField("locations", [firstActiveLocation.id.toString()]);
      }
    }
  };

  const handleItemAction = async (item: Item, action: 'view' | 'edit') => {
    
    
    
    setEditingItem(item);
    setIsViewMode(action === 'view');
    
    const category_id = item.category_id ? Number(item.category_id) : 0;
    
    // Get the auth token from localStorage
    const adminData = localStorage.getItem('Admin');
    let token = '';
    if (adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        token = parsedData.token;
        
        if (!token) {
          
          return;
        }
      } catch (error) {
        
        return;
      }
    } else {
      
      return;
    }

    // Set basic form data with token - locations will be populated by API response
    setFormData({
      name: item.name || "",
      category_id: category_id,
      quantity: item.quantity ? item.quantity.toString() : "0",
      quantity_unit_id: Number(item.quantity_unit_id || item.quantity_unit || 0),
      barcode: item.barcode || "",
      price: item.price ? item.price.toString() : "0",
      online_price: item.online_price ? item.online_price.toString() : "0",
      locations: [], // Will be populated by API response in ItemDialog
      module_type: 2,
      discount_type_id: Number(item.discount_type_id || item.discount_type || 0),
      discount: item.discount || "0",
      online_discount: item.online_discount || "0",
      description: item.description || "",
      image: null,
      imagePreview: "",
      imageToken: token,
      status: item.status === 1 ? 1 : 0
    });

    // Fetch image from attachments API using the proper service
    try {
      
      
      
      
      const response = await attachmentsApi.getAttachments({
        module_type: 2,
        module_id: item.id
      });

      
      
      

      const attachments = response.attachment || [];
      
      
      
      if (attachments.length > 0 && attachments[0].upload_path) {
        const imageUrl = attachments[0].upload_path;
        
        
        setFormData(prev => ({
          ...prev,
          imagePreview: imageUrl,
          imageToken: token
        }));
      } else {
        
      }
    } catch (error: any) {
      
      
      
      
      
    }
    
    setIsItemDialogOpen(true);
  };

  return {
    isItemDialogOpen,
    setIsItemDialogOpen,
    isViewMode,
    setIsViewMode,
    editingItem,
    setEditingItem,
    formData,
    updateFormField,
    resetForm,
    handleItemAction,
    setDefaultLocation
  };
}
