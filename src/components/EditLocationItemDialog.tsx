
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api/client";
import { tagsService } from "@/services/api/items/tags";
import { useQuery } from "@tanstack/react-query";

interface EditLocationItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
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
    product_id?: number;
    restrictAttributeCombinations?: boolean;
    isOfferHalfNHalf?: boolean;
  };
  onSubmit?: (item: any) => void;
}

const EditLocationItemDialog = ({ 
  open, 
  onOpenChange, 
  item,
  onSubmit 
}: EditLocationItemDialogProps) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    onlinePrice: "",
    discountType: "Flat",
    discount: "",
    onlineDiscount: "",
    tags: [] as string[],
    active: true,
    online: true,
    product_id: 0,
    restrictAttributeCombinations: true,
    isOfferHalfNHalf: true
  });

  const { toast } = useToast();

  // Helper function to map API discount type to form discount type
  const mapApiDiscountTypeToForm = (apiType: string) => {
    if (apiType === "Percent") return "Percentage";
    if (apiType === "Flat") return "Flat";
    return "Flat"; // default fallback
  };

  // Debug: Monitor formData changes
  useEffect(() => {
    
  }, [formData]);

  // Fetch tags from API
  const { data: tagsData, isLoading: isTagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsService.getTags({ per_page: 999999, page: 1 }),
    select: (res: any) => (res as any)?.tags || (res as any)?.data || [],
  });
  
  // Convert tags to options for MultiSelect
  const tagOptions = (tagsData || []).map((tag: any) => ({
    label: tag.tag,
    value: tag.id,
  }));

  useEffect(() => {
    if (item) {
      const tagIds = item.tags?.filter(tagName => tagName && typeof tagName === 'string').map(tagName => {
        // Find the tag ID based on the tag name
        const foundTag = tagsData?.find((tag: any) => tag && tag.tag === tagName);
        return foundTag?.id || tagName;
      }) || [];

      // Map "Percent" from API to "Percentage" for the form
      const mappedDiscountType = mapApiDiscountTypeToForm(item.discountType);
       // Debug log

      setFormData({
        id: item.id || "",
        name: item.name || "",
        price: item.price || "",
        onlinePrice: item.onlinePrice || "",
        discountType: mappedDiscountType,
        discount: item.discount || "",
        onlineDiscount: item.onlineDiscount || "",
        tags: tagIds,
        active: item.active !== undefined ? item.active : true,
        online: item.online !== undefined ? item.online : true,
        product_id: item.product_id || 0,
        restrictAttributeCombinations: item.restrictAttributeCombinations !== undefined ? item.restrictAttributeCombinations : true,
        isOfferHalfNHalf: item.isOfferHalfNHalf !== undefined ? item.isOfferHalfNHalf : true
      });
    } else {
      setFormData({
        id: "",
        name: "",
        price: "",
        onlinePrice: "",
        discountType: "Flat",
        discount: "",
        onlineDiscount: "",
        tags: [],
        active: true,
        online: true,
        product_id: 0,
        restrictAttributeCombinations: true,
        isOfferHalfNHalf: true
      });
    }
  }, [item, open, tagsData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.price.trim()) {
      toast({
        title: "Error",
        description: "Price is required",
        variant: "destructive"
      });
      return;
    }

    if (onSubmit) {
      // Convert tag IDs back to tag names for the API
      const tagNames = formData.tags.filter(tagId => tagId).map(tagId => {
        const foundTag = tagsData?.find((tag: any) => tag && tag.id === tagId);
        return foundTag?.tag || tagId;
      });

      onSubmit({
        ...formData,
        tags: tagNames,
        restrictAttributeCombinations: formData.restrictAttributeCombinations,
        isOfferHalfNHalf: formData.isOfferHalfNHalf
      });
    }
  };

  const handleReset = () => {
    if (item) {
      const tagIds = item.tags?.filter(tagName => tagName && typeof tagName === 'string').map(tagName => {
        // Find the tag ID based on the tag name
        const foundTag = tagsData?.find((tag: any) => tag && tag.tag === tagName);
        return foundTag?.id || tagName;
      }) || [];

      // Map "Percent" from API to "Percentage" for the form
      const mappedDiscountType = mapApiDiscountTypeToForm(item.discountType);

      setFormData({
        id: item.id || "",
        name: item.name || "",
        price: item.price || "",
        onlinePrice: item.onlinePrice || "",
        discountType: mappedDiscountType,
        discount: item.discount || "",
        onlineDiscount: item.onlineDiscount || "",
        tags: tagIds,
        active: item.active !== undefined ? item.active : true,
        online: item.online !== undefined ? item.online : true,
        product_id: item.product_id || 0,
        restrictAttributeCombinations: item.restrictAttributeCombinations !== undefined ? item.restrictAttributeCombinations : true,
        isOfferHalfNHalf: item.isOfferHalfNHalf !== undefined ? item.isOfferHalfNHalf : true
      });
    } else {
      setFormData({
        id: "",
        name: "",
        price: "",
        onlinePrice: "",
        discountType: "Flat",
        discount: "",
        onlineDiscount: "",
        tags: [],
        active: true,
        online: true,
        product_id: 0,
        restrictAttributeCombinations: true,
        isOfferHalfNHalf: true
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Location Items
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* Main fields in 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter item name"
                required
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price*</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="$ 0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onlinePrice">Online Price</Label>
              <Input
                id="onlinePrice"
                value={formData.onlinePrice}
                onChange={(e) => handleChange("onlinePrice", e.target.value)}
                placeholder="$ 0"
              />
            </div>
          </div>

          {/* Discount fields in 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={formData.discountType} onValueChange={(value) => handleChange("discountType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flat">Flat</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                value={formData.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="onlineDiscount">Online Discount</Label>
              <Input
                id="onlineDiscount"
                value={formData.onlineDiscount}
                onChange={(e) => handleChange("onlineDiscount", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label>Tags</Label>
            {isTagsLoading ? (
              <div className="text-sm text-muted-foreground">Loading tags...</div>
            ) : (
              <MultiSelect
                options={tagOptions}
                value={formData.tags}
                onChange={(values) => handleChange("tags", values)}
                placeholder="Select tags"
              />
            )}
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="active" className="font-medium">Active</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleChange("active", checked)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="online" className="font-medium">Available Online</Label>
              <Switch
                id="online"
                checked={formData.online}
                onCheckedChange={(checked) => handleChange("online", checked)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="restrictAttributes" className="font-medium">Restrict Attribute Combinations</Label>
              <Switch
                id="restrictAttributes"
                checked={formData.restrictAttributeCombinations}
                onCheckedChange={(checked) => handleChange("restrictAttributeCombinations", checked)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="offerHalfHalf" className="font-medium">Offer Half & Half</Label>
              <Switch
                id="offerHalfHalf"
                checked={formData.isOfferHalfNHalf}
                onCheckedChange={(checked) => handleChange("isOfferHalfNHalf", checked)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              RESET
            </Button>
            <Button type="submit">
              SUBMIT
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationItemDialog;
