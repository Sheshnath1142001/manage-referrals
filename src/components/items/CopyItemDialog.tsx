import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api/client";
import { Switch } from "@/components/ui/switch";

interface CopyItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  categories: Array<{id: number, category: string}>;
  quantityUnits: Array<{id: number, unit: string}>;
  locations: Array<{id: number, name: string, status: number}>;
  discountTypes: Array<{id: number, type: string}>;
  fetchItems: () => void;
}

export const CopyItemDialog = ({
  isOpen,
  onOpenChange,
  item,
  categories,
  quantityUnits,
  locations,
  discountTypes,
  fetchItems,
}: CopyItemDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    quantity: "1",
    quantity_unit_id: "1",
    barcode: "",
    price: "",
    online_price: "",
    locations: [],
    discount_type_id: "1",
    discount: "0",
    online_discount: "0",
    description: "",
    status: 1,
    is_offer_half_n_half: 0
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Reset form data when dialog opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      // For copy dialog, use first active location if original item has no locations
      let initialLocations = item.locations || [];
      if (initialLocations.length === 0 && locations.length > 0) {
        const firstActiveLocation = locations.find(location => location.status === 1);
        if (firstActiveLocation) {
          initialLocations = [firstActiveLocation.id.toString()];
        }
      }
      
      setFormData({
        name: `${item.name || ""}-copy`,
        category_id: item.category_id?.toString() || "",
        quantity: item.quantity?.toString() || "1",
        quantity_unit_id: item.quantity_unit_id?.toString() || "1",
        barcode: item.barcode || "",
        price: item.price?.toString() || "",
        online_price: item.online_price?.toString() || "",
        locations: initialLocations,
        discount_type_id: item.discount_type_id?.toString() || "1",
        discount: item.discount?.toString() || "0",
        online_discount: item.online_discount?.toString() || "0",
        description: item.description || "",
        status: item.status || 1,
        is_offer_half_n_half: item.is_offer_half_n_half ? 1 : 0
      });
      
      // Reset image
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [isOpen, item, locations]);

  // Auto-select first active location if no location is selected - for copy dialog
  useEffect(() => {
    if (isOpen && locations.length > 0 && (!formData.locations || formData.locations.length === 0)) {
      const firstActiveLocation = locations.find(location => location.status === 1);
      if (firstActiveLocation) {
        updateFormField("locations", [firstActiveLocation.id.toString()]);
      }
    }
  }, [isOpen, locations, formData.locations]);

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.locations || formData.locations.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one location is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare form data for the multipart/form-data request
      const formDataToSend = new FormData();
      
      // Add all the required fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('quantity_unit', formData.quantity_unit_id);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('online_price', formData.online_price);
      formDataToSend.append('discount', formData.discount);
      formDataToSend.append('online_discount', formData.online_discount);
      formDataToSend.append('discount_type', formData.discount_type_id);
      formDataToSend.append('is_offer_half_n_half', formData.is_offer_half_n_half.toString());
      formDataToSend.append('status', formData.status.toString());
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('module_type', '2');

      // Add locations as restaurant_ids[]
      formData.locations.forEach(locationId => {
        formDataToSend.append('restaurant_ids[]', locationId.toString());
      });

      // Add optional fields if they exist
      if (formData.barcode) {
        formDataToSend.append('barcode', formData.barcode);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('attachment', selectedImage);
      }

      // Make the API request
      const response = await api.post('/product', formDataToSend);
      
      // Extract created product details from response with proper typing
      const responseData = response.data || response;
      const createdProduct = responseData?.product?.createdProduct || responseData?.createdProduct;
      
      if (createdProduct) {
        const categoryName = createdProduct.categories?.category || '';
        const quantityUnit = createdProduct.quantity_units?.unit || '';
        
        toast({
          title: "Success",
          description: `Item "${createdProduct.name}" has been created successfully with ID: ${createdProduct.id}${categoryName ? ` in category: ${categoryName}` : ''}`
        });

        // Log creation details for debugging
        console.log('Created product details:', {
          id: createdProduct.id,
          name: createdProduct.name,
          category: categoryName,
          quantityUnit,
          price: createdProduct.price,
          sequence: createdProduct.seq_no
        });
      } else {
        toast({
          title: "Success",
          description: "Item copied successfully"
        });
      }
      
      // Refresh items list and close dialog
      fetchItems();
      onOpenChange(false);
    } catch (error: any) {
      
      
      // Handle different types of error responses
      let errorMessage = "Failed to copy item. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-4 max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Copy Item
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Name*:</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormField("name", e.target.value)}
              placeholder="Item name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category*:</Label>
            <Select 
              value={formData.category_id.toString()} 
              onValueChange={(value) => updateFormField("category_id", value)}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(categories) ? categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.category}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity*:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="quantity"
                type="text"
                value={formData.quantity}
                onChange={(e) => updateFormField("quantity", e.target.value)}
              />
              
              <Select 
                value={formData.quantity_unit_id.toString()} 
                onValueChange={(value) => updateFormField("quantity_unit_id", value)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {quantityUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="barcode">Barcode:</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => updateFormField("barcode", e.target.value)}
              placeholder="Barcode"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price*:</Label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => updateFormField("price", e.target.value)}
                className="pl-6"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="online_price">Online Price:</Label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="online_price"
                type="number"
                value={formData.online_price}
                onChange={(e) => updateFormField("online_price", e.target.value)}
                className="pl-6"
              />
            </div>
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="locations">Locations*:</Label>
            <Select
              value={formData.locations[0]?.toString() || ""}
              onValueChange={(value) => {
                // Only allow selection if location is active (status = 1)
                const selectedLocation = locations.find(loc => loc.id.toString() === value);
                if (selectedLocation && selectedLocation.status === 1) {
                  updateFormField("locations", [value]);
                }
              }}
            >
              <SelectTrigger id="locations" className="mt-1">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem 
                    key={location.id} 
                    value={location.id.toString()}
                    disabled={location.status === 0}
                    className={location.status === 0 ? 'opacity-50 text-gray-400' : ''}
                  >
                    {location.name}
                    {location.status === 0 && (
                      <span className="text-xs text-gray-400 ml-1">(Inactive)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="discount_type">Discount Type:</Label>
            <Select
              value={formData.discount_type_id.toString()}
              onValueChange={(value) => updateFormField("discount_type_id", value)}
            >
              <SelectTrigger id="discount_type" className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {discountTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="discount">Discount:</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => updateFormField("discount", e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="online_discount">Online Discount:</Label>
            <Input
              id="online_discount"
              type="number"
              value={formData.online_discount}
              onChange={(e) => updateFormField("online_discount", e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="description">Description:</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateFormField("description", e.target.value)}
              placeholder="Description"
              className="mt-1"
            />
          </div>

          <div className="col-span-2">
            <Label>Image:</Label>
            <div className="mt-1 border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-gray-50" onClick={triggerFileInput}>
              {imagePreview ? (
                <div className="relative w-full aspect-square max-h-[200px] overflow-hidden flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-gray-500">
                  <Image className="h-16 w-16" />
                  <p className="mt-2">Click to upload image</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.status === 1}
              onCheckedChange={(checked) => updateFormField("status", checked ? 1 : 0)}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="offers_half"
              checked={formData.is_offer_half_n_half === 1}
              onCheckedChange={(checked) => updateFormField("is_offer_half_n_half", checked ? 1 : 0)}
            />
            <Label htmlFor="offers_half">Offers Half</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 