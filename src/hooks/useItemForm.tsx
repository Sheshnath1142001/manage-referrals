
import { useState, useEffect } from "react";
import { Item, ItemFormData } from "@/components/items/types";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getRestaurants } from "@/services/api/restaurants";

const defaultFormData: ItemFormData = {
  name: "",
  category_id: 0,
  quantity: "",
  quantity_unit_id: 0,
  barcode: "",
  price: "",
  online_price: "",
  locations: [], // Changed from ["All Locations"] to empty array
  discount_type_id: 0,
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

  // Fetch restaurants data
  const { data: restaurantsResponse } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => getRestaurants({ per_page: 100 }),
    enabled: true,
  });

  const restaurants = restaurantsResponse?.data?.data || [];

  // Set first restaurant as default when dialog opens for new item
  useEffect(() => {
    if (isItemDialogOpen && !editingItem && restaurants.length > 0) {
      setFormData(prev => ({
        ...prev,
        locations: [restaurants[0].id.toString()] // Set first restaurant ID as default
      }));
    }
  }, [isItemDialogOpen, editingItem, restaurants]);

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
      quantity_unit_id: item.quantity_unit_id || item.quantity_unit || 0,
      barcode: item.barcode || "",
      price: item.price ? item.price.toString() : "0",
      online_price: item.online_price ? item.online_price.toString() : "0",
      locations: ["All Locations"],
      discount_type_id: item.discount_type_id || item.discount_type || 0,
      discount: item.discount || "0",
      online_discount: item.online_discount || "0",
      description: item.description || "",
      image: null,
      imagePreview: "",
      imageToken: token,
      status: item.status === 1 ? 1 : 0
    });

    // Fetch image from attachments API
    try {
      const response = await axios.get('https://pratham-respos-testbe-v34.achyutlabs.cloud/api/attachments', {
        params: {
          module_type: 2,
          module_id: item.id
        },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Timezone': 'Asia/Calcutta'
        }
      });

      const attachments = response.data.attachment || [];
      if (attachments.length > 0 && attachments[0].upload_path) {
        const imageUrl = attachments[0].upload_path;
        setFormData(prev => ({
          ...prev,
          imagePreview: imageUrl,
          imageToken: token
        }));
      }
    } catch (error) {
      console.error('Error fetching image:', error);
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
    restaurants
  };
}
