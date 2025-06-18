import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationSettings {
  siteReference: string;
  addressLine1: string;
  addressLine2: string;
  abnNumber: string;
  phone: string;
  isDelivery: boolean;
  giftCardFeature: "Enabled" | "Disabled";
  dineInService: "Enabled" | "Disabled";
  is_cloud_printing_enabled: boolean;
  
  // Online Order Settings
  deliveryCharge: string;
  minimumOrderValue: string;
  pickupTimeDuration: string;
  onlineOrderSurchargeType: "Fixed" | "Percentage";
  onlineOrderSurchargeValue: string;
  onlineOrderDiscountType: "Fixed" | "Percentage";
  onlineOrderDiscountValue: string;
}

interface LocationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (settings: LocationSettings) => void;
  initialData?: LocationSettings;
}

const defaultSettings: LocationSettings = {
  siteReference: "",
  addressLine1: "",
  addressLine2: "",
  abnNumber: "",
  phone: "",
  isDelivery: false,
  giftCardFeature: "Enabled",
  dineInService: "Enabled",
  is_cloud_printing_enabled: false,
  
  deliveryCharge: "0",
  minimumOrderValue: "0",
  pickupTimeDuration: "30",
  onlineOrderSurchargeType: "Fixed",
  onlineOrderSurchargeValue: "0",
  onlineOrderDiscountType: "Percentage",
  onlineOrderDiscountValue: "0"
};

const LocationSettingsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}: LocationSettingsDialogProps) => {
  
  const [settings, setSettings] = useState<LocationSettings>(initialData || defaultSettings);
  
  // Reset form when dialog opens with initial data or open state changes
  useEffect(() => {
    
    if (open && initialData) {
      
      setSettings(initialData);
    } else if (open && !initialData) {
      // Reset to default settings if no initial data
      setSettings(defaultSettings);
    }
  }, [initialData, open]);
  
  const handleChange = (field: keyof LocationSettings, value: string | boolean) => {
    
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = () => {
    
    onSubmit(settings);
    onOpenChange(false);
  };
  
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <DialogHeader className="bg-primary text-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Restaurant Settings
            </DialogTitle>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-md"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto">
          {/* General Information Section */}
          <div className="p-6 space-y-6">
            <div className="inline-block bg-primary text-white px-4 py-1.5 rounded-md text-sm font-medium">
              General Information
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteReference" className="text-sm font-medium">
                  Site Reference*:
                </Label>
                <Input
                  id="siteReference"
                  value={settings.siteReference}
                  onChange={(e) => handleChange("siteReference", e.target.value)}
                  placeholder="Captain Cookes Doreen"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addressLine1" className="text-sm font-medium">
                  Address Line 1*:
                </Label>
                <Input
                  id="addressLine1"
                  value={settings.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  placeholder="47 Bassetts Road,"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addressLine2" className="text-sm font-medium">
                  Address Line 2*:
                </Label>
                <Input
                  id="addressLine2"
                  value={settings.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  placeholder="Doreen VIC 3754"
                  className="border-gray-300"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="abnNumber" className="text-sm font-medium">
                  ABN Number*:
                </Label>
                <Input
                  id="abnNumber"
                  value={settings.abnNumber}
                  onChange={(e) => handleChange("abnNumber", e.target.value)}
                  placeholder="97659245011"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone*:
                </Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="3908975559"
                  className="border-gray-300"
                />
              </div>
              
              <div className="flex items-center pt-8">
                <Label htmlFor="isDelivery" className="text-sm font-medium mr-3">
                  Is Delivery
                </Label>
                <Switch 
                  id="isDelivery" 
                  checked={settings.isDelivery}
                  onCheckedChange={(checked) => handleChange("isDelivery", checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Label htmlFor="is_cloud_printing_enabled" className="text-sm font-medium mr-3">
                  Cloud Printing
                </Label>
                <Switch 
                  id="is_cloud_printing_enabled" 
                  checked={settings.is_cloud_printing_enabled}
                  onCheckedChange={(checked) => handleChange("is_cloud_printing_enabled", checked)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="giftCardFeature" className="text-sm font-medium">
                  Gift Card Feature
                </Label>
                <Select 
                  value={settings.giftCardFeature} 
                  onValueChange={(value) => handleChange("giftCardFeature", value as "Enabled" | "Disabled")}
                >
                  <SelectTrigger id="giftCardFeature" className="border-gray-300">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enabled">Enabled</SelectItem>
                    <SelectItem value="Disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dineInService" className="text-sm font-medium">
                  Dine In Service
                </Label>
                <Select 
                  value={settings.dineInService} 
                  onValueChange={(value) => handleChange("dineInService", value as "Enabled" | "Disabled")}
                >
                  <SelectTrigger id="dineInService" className="border-gray-300">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enabled">Enabled</SelectItem>
                    <SelectItem value="Disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Online Order Settings Section */}
          <div className="p-6 space-y-6 border-t border-gray-200">
            <div className="inline-block bg-primary text-white px-4 py-1.5 rounded-md text-sm font-medium">
              Online Order Settings
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryCharge" className="text-sm font-medium">
                  Delivery Charge:
                </Label>
                <Input
                  id="deliveryCharge"
                  value={settings.deliveryCharge}
                  onChange={(e) => handleChange("deliveryCharge", e.target.value)}
                  placeholder="0"
                  type="number"
                  min="0"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue" className="text-sm font-medium">
                  Minimum Order Value to avail discount*:
                </Label>
                <Input
                  id="minimumOrderValue"
                  value={settings.minimumOrderValue}
                  onChange={(e) => handleChange("minimumOrderValue", e.target.value)}
                  placeholder="50"
                  type="number"
                  min="0"
                  className="border-gray-300"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pickupTimeDuration" className="text-sm font-medium">
                Pickup Time Duration(min)*:
              </Label>
              <Input
                id="pickupTimeDuration"
                value={settings.pickupTimeDuration}
                onChange={(e) => handleChange("pickupTimeDuration", e.target.value)}
                placeholder="30"
                type="number"
                min="0"
                className="border-gray-300"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="onlineOrderSurcharge" className="text-sm font-medium">
                  Online Order Surcharge*:
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={settings.onlineOrderSurchargeType} 
                    onValueChange={(value) => handleChange("onlineOrderSurchargeType", value as "Fixed" | "Percentage")}
                  >
                    <SelectTrigger id="onlineOrderSurchargeType" className="border-gray-300 w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="onlineOrderSurchargeValue"
                    value={settings.onlineOrderSurchargeValue}
                    onChange={(e) => handleChange("onlineOrderSurchargeValue", e.target.value)}
                    placeholder="2"
                    type="number"
                    min="0"
                    className="border-gray-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="onlineOrderDiscount" className="text-sm font-medium">
                  Online Order Discount*:
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={settings.onlineOrderDiscountType} 
                    onValueChange={(value) => handleChange("onlineOrderDiscountType", value as "Fixed" | "Percentage")}
                  >
                    <SelectTrigger id="onlineOrderDiscountType" className="border-gray-300 w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="onlineOrderDiscountValue"
                    value={settings.onlineOrderDiscountValue}
                    onChange={(e) => handleChange("onlineOrderDiscountValue", e.target.value)}
                    placeholder="0"
                    type="number"
                    min="0"
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Update Button */}
          <div className="p-6 flex justify-center border-t border-gray-200">
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-primary text-white hover:bg-primary/90 px-8"
            >
              UPDATE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSettingsDialog;
