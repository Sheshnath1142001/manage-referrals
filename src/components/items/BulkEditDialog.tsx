import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Item } from "@/components/items/types";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { itemsApi } from "@/services/api/items";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api/client";
import { API_ENDPOINTS } from "@/components/items/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuantityUnit {
  id: number;
  unit: string;
  status: number;
  restaurant_id: number | null;
}

interface DiscountType {
  id: number;
  type: string;
  status: number;
}

interface BulkEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Item[];
  onBulkUpdateSuccess: () => void;
  categories: any[];
  quantityUnits: any[];
  discountTypes: any[];
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const BulkEditDialog = ({
  isOpen,
  onOpenChange,
  selectedItems,
  onBulkUpdateSuccess,
  categories,
  quantityUnits: propQuantityUnits,
  discountTypes: propDiscountTypes
}: BulkEditDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [localQuantityUnits, setLocalQuantityUnits] = useState<QuantityUnit[]>([]);
  const [localDiscountTypes, setLocalDiscountTypes] = useState<DiscountType[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [bulkFormData, setBulkFormData] = useState({
    price: "",
    online_price: "",
    status: true,
    category_id: "",
    quantity_unit_id: "",
    discount_type_id: "",
    discount: "",
    online_discount: "",
  });

  // Separate formData for individual items
  const [individualFormData, setIndividualFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch quantity units
      const quantityUnitsResponse = await api.get(`${API_ENDPOINTS.QUANTITY_UNITS}?with_pre_defines=1`);
      if (quantityUnitsResponse?.data?.quantity_units) {
        setLocalQuantityUnits(quantityUnitsResponse.data.quantity_units);
      }

      // Fetch discount types
      const discountTypesResponse = await api.get(`${API_ENDPOINTS.DISCOUNT_TYPES}?status=1`);
      if (discountTypesResponse?.data?.discount_types) {
        setLocalDiscountTypes(discountTypesResponse.data.discount_types);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast({
        title: "Error",
        description: "Failed to load form data. Some options may be unavailable.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setBulkFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIndividualChange = (itemId: number, field: string, value: any) => {
    setIndividualFormData((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value,
      },
    }));
  };

  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create payload array for bulk update
      const payload = selectedItems.map(item => {
        // Get the selected quantity unit object
        const selectedQuantityUnit = quantityUnitsToUse.find(
          unit => unit.id.toString() === (bulkFormData.quantity_unit_id || item.quantity_unit_id?.toString())
        );
        
        // Create data object with values from bulkFormData or existing item values
        const data: Record<string, any> = {
          price: bulkFormData.price !== "" ? parseFloat(bulkFormData.price) : (item.price || 0),
          online_price: bulkFormData.online_price !== "" ? parseFloat(bulkFormData.online_price) : (item.online_price || 0),
          discount_type: bulkFormData.discount_type_id !== "" ? parseInt(bulkFormData.discount_type_id as string) : (item.discount_type_id || 1),
          discount: bulkFormData.discount !== "" ? parseFloat(bulkFormData.discount as string) : (parseFloat(item.discount || "0")),
          online_discount: bulkFormData.online_discount !== "" ? parseFloat(bulkFormData.online_discount as string) : (parseFloat(item.online_discount || "0")),
          quantity: 1, // Default to 1 for quantity
          quantity_unit: bulkFormData.quantity_unit_id !== "" ? parseInt(bulkFormData.quantity_unit_id as string) : (item.quantity_unit_id || 1),
          status: bulkFormData.status ? 1 : 0
        };
        
        // Add quantity_units object if we have the data
        if (selectedQuantityUnit) {
          data.quantity_units = {
            id: selectedQuantityUnit.id,
            unit: selectedQuantityUnit.unit,
            status: selectedQuantityUnit.status
          };
        }
        
        return {
          entityType: "products",
          id: item.id,
          data
        };
      });
      
      // Send request to bulk update API
      await api.put(`${apiBaseUrl}/bulk-update`, payload);
      
      toast({
        title: "Success",
        description: `Successfully updated ${selectedItems.length} items`,
      });
      
      onBulkUpdateSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating items:", error);
      toast({
        title: "Error",
        description: "Failed to update items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIndividualSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create payload array for bulk update
      const payload = Object.entries(individualFormData).map(([itemId, itemData]) => {
        // Find the item from selectedItems
        const item = selectedItems.find(item => item.id.toString() === itemId);
        if (!item) return null;
        
        // Get the selected quantity unit object
        const selectedQuantityUnit = quantityUnitsToUse.find(
          unit => unit.id.toString() === (itemData.quantity_unit_id || item.quantity_unit_id?.toString())
        );
        
        // Create data object with values from individualFormData or existing item values
        const data: Record<string, any> = {
          price: itemData.price !== undefined ? parseFloat(itemData.price) : (item.price || 0),
          online_price: itemData.online_price !== undefined ? parseFloat(itemData.online_price) : (item.online_price || 0),
          discount_type: itemData.discount_type_id !== undefined ? parseInt(itemData.discount_type_id as string) : (item.discount_type_id || 1),
          discount: itemData.discount !== undefined ? parseFloat(itemData.discount as string) : (parseFloat(item.discount || "0")),
          online_discount: itemData.online_discount !== undefined ? parseFloat(itemData.online_discount as string) : (parseFloat(item.online_discount || "0")),
          quantity: itemData.quantity !== undefined ? parseInt(itemData.quantity) : (item.quantity || 1),
          quantity_unit: itemData.quantity_unit_id !== undefined ? parseInt(itemData.quantity_unit_id as string) : (item.quantity_unit_id || 1),
          status: itemData.status !== undefined ? itemData.status : (item.status)
        };
        
        // Add quantity_units object if we have the data
        if (selectedQuantityUnit) {
          data.quantity_units = {
            id: selectedQuantityUnit.id,
            unit: selectedQuantityUnit.unit,
            status: selectedQuantityUnit.status
          };
        }
        
        return {
          entityType: "products",
          id: parseInt(itemId),
          data
        };
      }).filter(Boolean);
      
      // Send request to bulk update API
      await api.put(`${apiBaseUrl}/bulk-update`, payload);
      
      toast({
        title: "Success",
        description: `Successfully updated ${payload.length} items`,
      });
      
      onBulkUpdateSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating individual items:", error);
      toast({
        title: "Error",
        description: "Failed to update items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use either locally fetched data or props data
  const quantityUnitsToUse = localQuantityUnits.length > 0 ? localQuantityUnits : propQuantityUnits;
  const discountTypesToUse = localDiscountTypes.length > 0 ? localDiscountTypes : propDiscountTypes;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen p-0 m-0" hideCloseButton={true}>
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Selected Products</DialogTitle>
          <DialogDescription>Edit multiple products at once or individually</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Edit {selectedItems.length} Products</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="bulk-mode-toggle"
                  checked={isBulkMode}
                  onCheckedChange={setIsBulkMode}
                />
                <Label htmlFor="bulk-mode-toggle" className="text-white font-medium">
                  Bulk Edit Mode
                </Label>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-gray-800"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main edit area */}
          {isBulkMode ? (
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white p-6 rounded-lg border max-w-4xl mx-auto">
                <h2 className="text-lg font-medium mb-4">Apply changes to all selected items</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      placeholder="Set price for all"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkFormData.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="online_price">Online Price</Label>
                    <Input
                      id="online_price"
                      placeholder="Set online price for all"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkFormData.online_price}
                      onChange={(e) => handleFormChange("online_price", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      placeholder="Set discount for all"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkFormData.discount}
                      onChange={(e) => handleFormChange("discount", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="online_discount">Online Discount</Label>
                    <Input
                      id="online_discount"
                      placeholder="Set online discount for all"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkFormData.online_discount}
                      onChange={(e) => handleFormChange("online_discount", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select 
                      value={bulkFormData.category_id ? bulkFormData.category_id.toString() : undefined} 
                      onValueChange={(value) => handleFormChange("category_id", value)}
                    >
                      <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity_unit_id">Quantity Unit</Label>
                    <Select 
                      value={bulkFormData.quantity_unit_id ? bulkFormData.quantity_unit_id.toString() : undefined} 
                      onValueChange={(value) => handleFormChange("quantity_unit_id", value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                        <SelectValue placeholder="Select a quantity unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {quantityUnitsToUse.map((unit: any) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount_type_id">Discount Type</Label>
                    <Select 
                      value={bulkFormData.discount_type_id ? bulkFormData.discount_type_id.toString() : undefined} 
                      onValueChange={(value) => handleFormChange("discount_type_id", value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                        <SelectValue placeholder="Select a discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        {discountTypesToUse.map((type: any) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mt-4">
                      <Switch
                        id="status"
                        checked={bulkFormData.status}
                        onCheckedChange={(checked) => handleFormChange("status", checked)}
                      />
                      <Label htmlFor="status">Active</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-white">
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-gray-100 sticky top-0">
                    <TableRow>
                      <TableHead className="font-semibold">Product Name</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Online Price</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold">Quantity Unit</TableHead>
                      <TableHead className="font-semibold">Discount Type</TableHead>
                      <TableHead className="font-semibold">Discount</TableHead>
                      <TableHead className="font-semibold">Online Discount</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full h-9"
                            defaultValue={item.price}
                            onChange={(e) => handleIndividualChange(item.id, "price", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full h-9"
                            defaultValue={item.online_price}
                            onChange={(e) => handleIndividualChange(item.id, "online_price", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            className="w-full h-9"
                            defaultValue={item.quantity}
                            onChange={(e) => handleIndividualChange(item.id, "quantity", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.quantity_unit_id?.toString()}
                            onValueChange={(value) => handleIndividualChange(item.id, "quantity_unit_id", value)}
                            disabled={isLoadingData}
                          >
                            <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                              <SelectValue placeholder="Select a quantity unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {quantityUnitsToUse.map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                  {unit.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.discount_type_id?.toString()}
                            onValueChange={(value) => handleIndividualChange(item.id, "discount_type_id", value)}
                            disabled={isLoadingData}
                          >
                            <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                              <SelectValue placeholder="Select a discount type" />
                            </SelectTrigger>
                            <SelectContent>
                              {discountTypesToUse.map((type: any) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full h-9"
                            defaultValue={item.discount}
                            onChange={(e) => handleIndividualChange(item.id, "discount", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full h-9"
                            defaultValue={item.online_discount}
                            onChange={(e) => handleIndividualChange(item.id, "online_discount", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Switch
                              id={`status-${item.id}`}
                              defaultChecked={item.status === 1}
                              onCheckedChange={(checked) => handleIndividualChange(item.id, "status", checked ? 1 : 0)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Footer with actions */}
          <div className="p-4 border-t bg-white flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">
                Editing {selectedItems.length} product{selectedItems.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={isBulkMode ? handleBulkSubmit : handleIndividualSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 