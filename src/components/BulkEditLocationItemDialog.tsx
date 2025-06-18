import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronsUpDown, Plus, MinusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { locationItemsApi } from "@/services/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { MultiSelect } from "@/components/ui/multi-select";

// Define interface for Tag
interface Tag {
  id: string;
  tag: string;
}

// Define interface for LocationItem
interface LocationItem {
  id: string;
  product_id: number;
  products: {
    id: number;
    name: string;
    description: string | null;
    quantity: string;
    quantity_unit: number;
    price: string;
    online_price: string;
    status: number;
  };
  price: string;
  is_online: number;
  online_price: string;
  discount: string;
  online_discount?: string;
  discount_type_id?: number;
  status: number;
  restaurant_product_tags?: Array<{ id: string; tag: string }>;
}

interface BulkEditLocationItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: LocationItem[];
  onBulkUpdateSuccess: () => void;
  categories?: any[];
  quantityUnits?: any[];
  discountTypes?: any[];
}

export const BulkEditLocationItemDialog = ({
  isOpen,
  onOpenChange,
  selectedItems,
  onBulkUpdateSuccess,
  categories = [],
  quantityUnits = [],
  discountTypes = [],
}: BulkEditLocationItemDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch tags
  const { data: tagsData, isLoading: isLoadingTags } = useQuery({
    queryKey: ['bulk-edit-tags'],
    queryFn: async () => {
      const response = await api.get('/tags', { 
        params: {
          per_page: 999999,
          page: 1
        }
      });
      
      
      // Handle different response structures - API client returns response.data directly
      // Use type assertion since API client interceptor makes response structure unpredictable
      const apiResponse = response as any;
      if (apiResponse.tags && Array.isArray(apiResponse.tags)) {
        return apiResponse.tags;
      } else if (Array.isArray(apiResponse)) {
        return apiResponse;
      }
      
      
      return [];
    },
    enabled: isOpen // Only fetch when dialog is open
  });

  // Ensure availableTags is always an array
  const availableTags = Array.isArray(tagsData) ? tagsData : [];
  
  // Debug logging
  useEffect(() => {
    if (isOpen) {
      
      
    }
  }, [availableTags, isLoadingTags, isOpen]);

  // Prepare discount types for dropdown
  const discountTypeOptions = [
    { id: 1, name: "Flat" },
    { id: 2, name: "Percentage" }
  ];

  // Bulk form data state
  const [bulkFormData, setBulkFormData] = useState({
    price: "",
    online_price: "",
    discount: "",
    online_discount: "",
    discount_type_id: "",
    is_online: true,
    status: true,
    tags: [] as string[]
  });

  // Individual form data state - keyed by item id
  const [individualFormData, setIndividualFormData] = useState<Record<string, any>>({});

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      setBulkFormData({
        price: "",
        online_price: "",
        discount: "",
        online_discount: "",
        discount_type_id: "",
        is_online: true,
        status: true,
        tags: []
      });
      setIndividualFormData({});
      setIsBulkMode(true);
    }
  }, [isOpen]);

  // Handle changes to the bulk form
  const handleFormChange = (field: string, value: any) => {
    setBulkFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle changes to individual item forms
  const handleIndividualChange = (itemId: string, field: string, value: any) => {
    setIndividualFormData((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value,
      },
    }));
  };

  // Submit bulk changes
  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create payload for bulk update API
      const bulkUpdatePayload = selectedItems.map(item => {
        // Create data object with values from bulkFormData or existing item values
        const data: Record<string, any> = {};

        // Only include fields that were actually changed
        if (bulkFormData.price !== "") data.price = bulkFormData.price;
        if (bulkFormData.online_price !== "") data.online_price = bulkFormData.online_price;
        if (bulkFormData.discount !== "") data.discount = bulkFormData.discount;
        if (bulkFormData.online_discount !== "") data.online_discount = bulkFormData.online_discount;
        if (bulkFormData.discount_type_id !== "") data.discount_type = parseInt(bulkFormData.discount_type_id as string);
        
        // Boolean fields
        if (bulkFormData.is_online !== undefined) data.is_online = bulkFormData.is_online ? 1 : 0;
        if (bulkFormData.status !== undefined) data.status = bulkFormData.status ? 1 : 0;
        
        // Add tags if they were selected - convert tag IDs to tag names
        if (bulkFormData.tags && bulkFormData.tags.length > 0) {
          // Get tag names from tag IDs
          const tagNames = bulkFormData.tags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? tag.tag : "";
          }).filter(Boolean);
          
          data.tags = tagNames;
        }
        
        return {
          entityType: "restaurant_products",
          id: item.id,
          data
        };
      });
      
      // Make bulk update request
      
      await locationItemsApi.bulkUpdate(bulkUpdatePayload);
      
      // Show success message
      toast({
        title: "Success",
        description: `Updated ${selectedItems.length} items successfully`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['locationItems'] });
      
      // Close dialog and notify parent
      onOpenChange(false);
      onBulkUpdateSuccess();
    } catch (error) {
      
      
      // Handle validation errors
      if (error.response?.data) {
        const validationErrors = error.response.data;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          // Display the first validation error
          toast({
            title: "Validation Error",
            description: validationErrors[0].message || "Invalid data submitted",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update items. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update items. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit individual changes
  const handleIndividualSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create bulk update payload for items with individual changes
      const bulkUpdatePayload = Object.entries(individualFormData).map(([itemId, itemData]) => {
        // Find the item from selectedItems
        const item = selectedItems.find(item => item.id === itemId);
        if (!item) return null;
        
        // Create data object with only modified values
        const data: Record<string, any> = {};
        
        // Only include fields that were actually changed
        if (itemData.price !== undefined) data.price = itemData.price;
        if (itemData.online_price !== undefined) data.online_price = itemData.online_price;
        if (itemData.discount !== undefined) data.discount = itemData.discount;
        if (itemData.online_discount !== undefined) data.online_discount = itemData.online_discount;
        if (itemData.discount_type_id !== undefined) data.discount_type = parseInt(itemData.discount_type_id);
        if (itemData.is_online !== undefined) data.is_online = itemData.is_online === 1 ? 1 : 0;
        if (itemData.status !== undefined) data.status = itemData.status === 1 ? 1 : 0;
        
        // Handle tags if changed - convert tag IDs to tag names
        if (itemData.tags) {
          // Get tag names from tag IDs
          const tagNames = itemData.tags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? tag.tag : "";
          }).filter(Boolean);
          
          data.tags = tagNames;
        }
        
        return {
          entityType: "restaurant_products",
          id: itemId,
          data
        };
      }).filter(Boolean); // Filter out null values
      
      // Make bulk update request
      if (bulkUpdatePayload.length > 0) {
        
        await locationItemsApi.bulkUpdate(bulkUpdatePayload);
      }
      
      // Show success message
      toast({
        title: "Success",
        description: `Updated ${bulkUpdatePayload.length} items successfully`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['locationItems'] });
      
      // Close dialog and notify parent
      onOpenChange(false);
      onBulkUpdateSuccess();
    } catch (error) {
      
      
      // Handle validation errors
      if (error.response?.data) {
        const validationErrors = error.response.data;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          // Display the first validation error
          toast({
            title: "Validation Error",
            description: validationErrors[0].message || "Invalid data submitted",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update items. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update items. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tag names from tag IDs
  const getTagNames = (tagIds: string[]): string => {
    if (!tagIds || !Array.isArray(availableTags) || availableTags.length === 0) return "";
    
    return tagIds
      .map(id => {
        const tag = availableTags.find(t => t.id === id);
        return tag ? tag.tag : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Get item current tags as an array of tag IDs
  const getItemTags = (item: LocationItem): string[] => {
    if (!item.restaurant_product_tags) return [];
    return item.restaurant_product_tags.filter(tag => tag && tag.id).map(tag => tag.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full h-[100vh] p-0 m-0 rounded-none overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 border-b pb-4">
          <DialogTitle className="text-xl">Bulk Edit Location Items</DialogTitle>
        </DialogHeader>

        {/* Main content area - scrollable */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs for bulk vs individual edit */}
          <Tabs defaultValue="bulk" className="w-full h-full flex flex-col" onValueChange={(value) => setIsBulkMode(value === "bulk")}>
            <div className="px-6 pt-4">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="bulk">Bulk Edit</TabsTrigger>
                <TabsTrigger value="individual">Individual Edit</TabsTrigger>
              </TabsList>
            </div>

            {/* Bulk Edit Mode */}
            <TabsContent value="bulk" className="px-6 py-4 border-t flex-1 overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <Label htmlFor="bulk-price">Price</Label>
                  <Input
                    id="bulk-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full h-9 mt-2"
                    placeholder="Leave empty to keep current"
                    value={bulkFormData.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-online-price">Online Price</Label>
                  <Input
                    id="bulk-online-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full h-9 mt-2"
                    placeholder="Leave empty to keep current"
                    value={bulkFormData.online_price}
                    onChange={(e) => handleFormChange("online_price", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-discount">Discount</Label>
                  <Input
                    id="bulk-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full h-9 mt-2"
                    placeholder="Leave empty to keep current"
                    value={bulkFormData.discount}
                    onChange={(e) => handleFormChange("discount", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-online-discount">Online Discount</Label>
                  <Input
                    id="bulk-online-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full h-9 mt-2"
                    placeholder="Leave empty to keep current"
                    value={bulkFormData.online_discount}
                    onChange={(e) => handleFormChange("online_discount", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-discount-type">Discount Type</Label>
                  <Select 
                    value={bulkFormData.discount_type_id} 
                    onValueChange={(value) => handleFormChange("discount_type_id", value)}
                  >
                    <SelectTrigger className="h-9 bg-white border border-gray-300 mt-2">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypeOptions.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bulk-tags">Tags</Label>
                  <MultiSelect
                    options={availableTags.map(tag => {
                      
                      return { label: tag.tag, value: tag.id };
                    })}
                    value={bulkFormData.tags}
                    onChange={(values) => handleFormChange("tags", values)}
                    placeholder="Select tags"
                    className="h-9 bg-white border border-gray-300 mt-2"
                    disabled={isLoadingTags}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    id="bulk-is-online"
                    checked={bulkFormData.is_online}
                    onCheckedChange={(checked) => handleFormChange("is_online", checked)}
                  />
                  <Label htmlFor="bulk-is-online">Available Online</Label>
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    id="bulk-status"
                    checked={bulkFormData.status}
                    onCheckedChange={(checked) => handleFormChange("status", checked)}
                  />
                  <Label htmlFor="bulk-status">Active</Label>
                </div>
              </div>

              {/* Show preview of changes */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Preview Changes</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>New Price</TableHead>
                        <TableHead>Current Discount</TableHead>
                        <TableHead>New Discount</TableHead>
                        <TableHead>Current Tags</TableHead>
                        <TableHead>New Tags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.products.name}</TableCell>
                          <TableCell>{parseFloat(item.price).toFixed(2)}</TableCell>
                          <TableCell className={bulkFormData.price ? "font-semibold text-blue-600" : "text-gray-400 italic"}>
                            {bulkFormData.price ? parseFloat(bulkFormData.price).toFixed(2) : "Unchanged"}
                          </TableCell>
                          <TableCell>{parseFloat(item.discount || "0").toFixed(2)}</TableCell>
                          <TableCell className={bulkFormData.discount ? "font-semibold text-blue-600" : "text-gray-400 italic"}>
                            {bulkFormData.discount ? parseFloat(bulkFormData.discount).toFixed(2) : "Unchanged"}
                          </TableCell>
                          <TableCell>
                            {item.restaurant_product_tags?.filter(tag => tag && tag.tag).map(tag => tag.tag).join(", ") || "None"}
                          </TableCell>
                          <TableCell className={bulkFormData.tags.length > 0 ? "font-semibold text-blue-600" : "text-gray-400 italic"}>
                            {bulkFormData.tags.length > 0 ? getTagNames(bulkFormData.tags) : "Unchanged"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Individual Edit Mode */}
            <TabsContent value="individual" className="px-6 py-4 border-t flex-1 overflow-auto">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-[200px]">Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Online Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Online Discount</TableHead>
                      <TableHead>Discount Type</TableHead>
                      <TableHead className="w-[200px]">Tags</TableHead>
                      <TableHead>Online</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.products.name}</TableCell>
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
                            step="0.01"
                            className="w-full h-9"
                            defaultValue={item.discount || "0"}
                            onChange={(e) => handleIndividualChange(item.id, "discount", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full h-9"
                            defaultValue={item.online_discount || "0"}
                            onChange={(e) => handleIndividualChange(item.id, "online_discount", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={String(item.discount_type_id || 1)}
                            onValueChange={(value) => handleIndividualChange(item.id, "discount_type_id", value)}
                          >
                            <SelectTrigger className="h-9 bg-white border border-gray-300">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {discountTypeOptions.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <MultiSelect
                            options={Array.isArray(availableTags) ? availableTags.map(tag => ({ label: tag.tag, value: tag.id })) : []}
                            value={individualFormData[item.id]?.tags || getItemTags(item)}
                            onChange={(values) => handleIndividualChange(item.id, "tags", values)}
                            placeholder="Select tags"
                            className="h-9 bg-white border border-gray-300"
                            disabled={isLoadingTags}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Switch
                              id={`online-${item.id}`}
                              defaultChecked={item.is_online === 1}
                              onCheckedChange={(checked) => handleIndividualChange(item.id, "is_online", checked ? 1 : 0)}
                            />
                          </div>
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Fixed Footer with actions - always visible */}
        <div className="p-4 border-t bg-white flex justify-between items-center shrink-0">
          <div>
            <span className="text-sm text-gray-500">
              Editing {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
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
      </DialogContent>
    </Dialog>
  );
}; 