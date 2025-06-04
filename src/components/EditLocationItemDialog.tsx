import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import type { OptionType as Option } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api/client";
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

  // Fetch tags from API
  const { data: tagsData, isLoading: isTagsLoading, refetch: refetchTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get('/tags', { params: { per_page: 999999, page: 1 } });
      console.log('Tags API response:', response);
      return response;
    },
    select: (res) => res.tags || [],
  });
  
  // Convert tags to options for MultiSelect
  const tagOptions: Option[] = (tagsData || []).map((tag: any) => ({
    label: tag.tag,
    value: tag.id,
  }));

  useEffect(() => {
    if (item) {
      const tagIds = item.tags?.map(tagName => {
        // Find the tag ID based on the tag name
        const foundTag = tagsData?.find((tag: any) => tag.tag === tagName);
        return foundTag?.id || tagName;
      }) || [];

      setFormData({
        id: item.id || "",
        name: item.name || "",
        price: item.price || "",
        onlinePrice: item.onlinePrice || "",
        discountType: item.discountType || "Flat",
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
      const tagNames = formData.tags.map(tagId => {
        const foundTag = tagsData?.find((tag: any) => tag.id === tagId);
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
      const tagIds = item.tags?.map(tagName => {
        // Find the tag ID based on the tag name
        const foundTag = tagsData?.find((tag: any) => tag.tag === tagName);
        return foundTag?.id || tagName;
      }) || [];

      setFormData({
        id: item.id || "",
        name: item.name || "",
        price: item.price || "",
        onlinePrice: item.onlinePrice || "",
        discountType: item.discountType || "Flat",
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
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-black text-white p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">Edit Location Items</DialogTitle>
            <DialogClose className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Name*:
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="font-semibold">
                Price*:
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="$ 0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onlinePrice" className="font-semibold">
                Online Price:
              </Label>
              <Input
                id="onlinePrice"
                value={formData.onlinePrice}
                onChange={(e) => handleChange("onlinePrice", e.target.value)}
                placeholder="$ 0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountType" className="font-semibold">
                Discount Type:
              </Label>
              <Select 
                value={formData.discountType} 
                onValueChange={(value) => handleChange("discountType", value)}
              >
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flat">Flat</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount" className="font-semibold">
                Discount:
              </Label>
              <Input
                id="discount"
                value={formData.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="onlineDiscount" className="font-semibold">
                Online Discount:
              </Label>
              <Input
                id="onlineDiscount"
                value={formData.onlineDiscount}
                onChange={(e) => handleChange("onlineDiscount", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 col-span-3">
              <Label className="font-semibold">
                Tags:
              </Label>
              <div className="flex flex-col space-y-2">
                {isTagsLoading ? (
                  <div className="text-sm text-gray-500">Loading tags...</div>
                ) : (
                  <MultiSelect
                    options={tagOptions}
                    selected={formData.tags}
                    onChange={(values) => handleChange("tags", values)}
                    placeholder="Select tags"
                    className="w-full"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                Active:
                <Switch 
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange("active", checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                Available Online:
                <Switch 
                  checked={formData.online}
                  onCheckedChange={(checked) => handleChange("online", checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                Restrict Attribute Combinations:
                <Switch 
                  checked={formData.restrictAttributeCombinations}
                  onCheckedChange={(checked) => handleChange("restrictAttributeCombinations", checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                Offer Half & Half:
                <Switch 
                  checked={formData.isOfferHalfNHalf}
                  onCheckedChange={(checked) => handleChange("isOfferHalfNHalf", checked)}
                />
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-100 p-4 border-t border-gray-200">
          <div className="flex justify-end gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationItemDialog;
