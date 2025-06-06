
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

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsItemDialogOpen(false);
    setEditingItem(null);
    setIsViewMode(false);
  };

  const handleItemAction = async (item: Item, action: 'view' | 'edit') => {
    console.log('handleItemAction called with:', { item, action });
    console.log('Item ID:', item.id, 'Type:', typeof item.id);
    
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
        console.log('Token found:', token ? 'Yes' : 'No');
        if (!token) {
          console.error('No token found in admin data');
          return;
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        return;
      }
    } else {
      console.error('No admin data found in localStorage');
      return;
    }

    // Set basic form data with token
    setFormData({
  name: item.name || "",
  category_id: category_id,
  quantity: item.quantity ? item.quantity.toString() : "0",
  quantity_unit_id: Number(item.quantity_unit_id || item.quantity_unit || 0),
  barcode: item.barcode || "",
  price: item.price ? item.price.toString() : "0",
  online_price: item.online_price ? item.online_price.toString() : "0",
  locations: [],
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
      console.log('=== STARTING ATTACHMENTS API CALL ===');
      console.log('Fetching attachments for module_id:', item.id, 'module_type: 2');
      console.log('API Base URL:', import.meta.env.API_BASE_URL);
      
      const response = await attachmentsApi.getAttachments({
        module_type: 2,
        module_id: item.id
      });

      console.log('=== ATTACHMENTS API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response type:', typeof response);

      const attachments = response.attachment || [];
      console.log('Parsed attachments:', attachments);
      console.log('Number of attachments:', attachments.length);
      
      if (attachments.length > 0 && attachments[0].upload_path) {
        const imageUrl = attachments[0].upload_path;
        console.log('Found image URL:', imageUrl);
        
        setFormData(prev => ({
          ...prev,
          imagePreview: imageUrl,
          imageToken: token
        }));
      } else {
        console.log('No attachments found');
      }
    } catch (error: any) {
      console.error('=== ATTACHMENTS API ERROR ===');
      console.error('Error fetching attachments:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
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
    handleItemAction
  };
}
