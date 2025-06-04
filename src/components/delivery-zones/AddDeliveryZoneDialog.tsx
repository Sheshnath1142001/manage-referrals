import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { postcodesGeoApi, PostcodeGeo } from '@/services/api/postcodesGeo';
import { deliveryZonesApi } from '@/services/api/deliveryZones';
import { Check, ChevronsUpDown, Plus, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeliveryZoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

interface ChargeItem {
  min_order_amount: string;
  delivery_charge: string;
}

export function DeliveryZoneFormDialog({ open, onOpenChange, mode, initialData, onSubmit, onClose }: DeliveryZoneFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { restaurants } = useGetRestaurants();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<"distance" | "area">("distance");
  const [fromDistance, setFromDistance] = useState("");
  const [toDistance, setToDistance] = useState("");
  const [postcodeInput, setPostcodeInput] = useState("");
  const [postcodeOptions, setPostcodeOptions] = useState<PostcodeGeo[]>([]);
  const [selectedPostcode, setSelectedPostcode] = useState<PostcodeGeo | null>(null);
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [chargeItems, setChargeItems] = useState<ChargeItem[]>([
    { min_order_amount: "", delivery_charge: "" }
  ]);
  const [active, setActive] = useState(true);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState("");
  const [openPostcodePopover, setOpenPostcodePopover] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const isViewMode = mode === 'view';

  // Set default restaurant if available
  useEffect(() => {
    if (restaurants.length > 0 && !restaurantId) {
      setRestaurantId(String(restaurants[0].id));
    }
  }, [restaurants, restaurantId]);

  // For debugging - monitor postcodeOptions changes
  useEffect(() => {
    console.log("Current postcodeOptions:", postcodeOptions);
  }, [postcodeOptions]);
  
  // Debounce postcode input
  useEffect(() => {
    if (zoneType !== 'area' || !postcodeInput || postcodeInput.length < 2) {
      return;
    }
    
    setPostcodeLoading(true);
    setPostcodeError("");
    
    const timeout = setTimeout(() => {
      console.log("Searching postcodes for:", postcodeInput);
      postcodesGeoApi.search(postcodeInput, 15)
        .then(res => {
          console.log("Postcode API raw response:", res);
          
          // Handle various possible response formats
          try {
            let validPostcodes = [];
            
            // Direct response structure: { success: true, data: [...] }
            if (res?.data?.success && Array.isArray(res.data.data)) {
              validPostcodes = res.data.data;
              console.log("Case 1: Direct data array access");
            } 
            // Axios wrapper: { data: { success: true, data: [...] } }
            else if (res && res.data && res.data.success && Array.isArray(res.data.data)) {
              validPostcodes = res.data.data;
              console.log("Case 2: Nested data.data array access");
            }
            // Raw array: [...]
            else if (Array.isArray(res)) {
              validPostcodes = res;
              console.log("Case 3: Raw array access");
            }
            // Unknown format
            else {
              console.error("Cannot extract postcodes from response:", res);
              validPostcodes = [];
            }
            
            console.log("Setting options with data:", validPostcodes);
            setPostcodeOptions(validPostcodes);
          } catch (parseError) {
            console.error("Error parsing API response:", parseError);
            setPostcodeOptions([]);
            setPostcodeError("Error processing response data");
          }
          
          setPostcodeLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch postcodes:", error);
          setPostcodeOptions([]);
          setPostcodeLoading(false);
          setPostcodeError("Failed to fetch postcodes");
        });
    }, 400);
    
    return () => clearTimeout(timeout);
  }, [postcodeInput, zoneType]);

  // Populate form fields from initialData when dialog opens or initialData changes
  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setZoneType(initialData.zone_type === 2 || initialData.zoneType === 'area' ? 'area' : 'distance');
      setFromDistance(initialData.from_distance || initialData.fromDistance || "");
      setToDistance(initialData.to_distance || initialData.toDistance || "");
      setRestaurantId(initialData.restaurant_id ? String(initialData.restaurant_id) : "");
      setActive(initialData.status === 1 || initialData.status === 'Active');
      
      // Handle delivery zone charges
      if (initialData.delivery_zone_charges && Array.isArray(initialData.delivery_zone_charges)) {
        const charges = initialData.delivery_zone_charges.map(charge => ({
          min_order_amount: charge.min_order_amount || '',
          delivery_charge: charge.delivery_charge || ''
        }));
        setChargeItems(charges.length > 0 ? charges : [{ min_order_amount: '', delivery_charge: '' }]);
      } else if (initialData.charges) {
        setChargeItems(initialData.charges);
      } else {
        setChargeItems([{ min_order_amount: '', delivery_charge: '' }]);
      }

      if (initialData.postcode && initialData.suburb) {
        setSelectedPostcode({ 
          postcode: initialData.postcode, 
          suburb: initialData.suburb, 
          id: 0,
          state: '',
          latitude: '',
          longitude: ''
        });
        setPostcodeInput(initialData.postcode);
      } else {
        setSelectedPostcode(null);
        setPostcodeInput("");
      }
    }
    if (!open) {
      setFormErrors({});
    }
  }, [open, initialData]);

  // Add a charge item row
  const addChargeItem = () => {
    setChargeItems([...chargeItems, { min_order_amount: "", delivery_charge: "" }]);
  };

  // Remove a charge item row at the specified index
  const removeChargeItem = (index: number) => {
    if (chargeItems.length > 1) {
      const newItems = [...chargeItems];
      newItems.splice(index, 1);
      setChargeItems(newItems);
    }
  };

  // Handle updating a charge item
  const updateChargeItem = (index: number, field: keyof ChargeItem, value: string) => {
    const newItems = [...chargeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setChargeItems(newItems);
  };

  // Create delivery zone mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => deliveryZonesApi.createDeliveryZone(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Delivery zone created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
      handleReset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error creating delivery zone:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery zone",
        variant: "destructive"
      });
    }
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) errors.name = "Name is required";
    if (!restaurantId) errors.restaurantId = "Restaurant is required";
    
    if (zoneType === "distance") {
      if (!fromDistance) errors.fromDistance = "From distance is required";
      if (!toDistance) errors.toDistance = "To distance is required";
    } else if (zoneType === "area") {
      if (!selectedPostcode) errors.postcode = "Postcode is required";
    }
    
    // Validate each charge item
    let hasChargeErrors = false;
    chargeItems.forEach((item, index) => {
      if (!item.min_order_amount) {
        errors[`minOrderAmount_${index}`] = "Minimum order amount is required";
        hasChargeErrors = true;
      }
      if (!item.delivery_charge) {
        errors[`deliveryCharge_${index}`] = "Delivery charge is required";
        hasChargeErrors = true;
      }
    });
    
    if (chargeItems.length === 0) {
      errors.charges = "At least one charge item is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setZoneType("distance");
    setFromDistance("");
    setToDistance("");
    setPostcodeInput("");
    setPostcodeOptions([]);
    setSelectedPostcode(null);
    setChargeItems([{ min_order_amount: "", delivery_charge: "" }]);
    setActive(true);
    setPostcodeError("");
    setFormErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check form for errors",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare payload
    const payload = {
      name,
      description,
      restaurant_id: parseInt(restaurantId),
      status: active ? 1 : 0,
      zone_type: zoneType === "distance" ? 1 : 2,
      charges: chargeItems.map((item, idx) => {
        // If editing, preserve id/zone_id/status if present
        if (mode === 'edit' && initialData?.delivery_zone_charges?.[idx]) {
          return {
            id: initialData.delivery_zone_charges[idx].id,
            zone_id: initialData.delivery_zone_charges[idx].zone_id,
            min_order_amount: item.min_order_amount,
            delivery_charge: item.delivery_charge,
            status: initialData.delivery_zone_charges[idx].status || 1
          };
        }
        return {
          min_order_amount: item.min_order_amount,
          delivery_charge: item.delivery_charge,
          status: 1
        };
      })
    };
    
    // Add distance or postcode based on zone type
    if (zoneType === "distance") {
      Object.assign(payload, {
        from_distance: fromDistance,
        to_distance: toDistance
      });
    } else if (zoneType === "area" && selectedPostcode) {
      Object.assign(payload, {
        postcode: selectedPostcode.postcode,
        suburb: selectedPostcode.suburb
      });
    }
    
    if (mode === 'edit') {
      onSubmit(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Delivery Zone' : mode === 'edit' ? 'Edit Delivery Zone' : 'View Delivery Zone'}
            </DialogTitle>
          </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
                <Input
                id="name"
                  value={name}
                onChange={(e) => setName(e.target.value)}
                  disabled={isViewMode}
                />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurant</Label>
              <Select 
                value={restaurantId} 
                onValueChange={setRestaurantId}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={String(restaurant.id)}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.restaurantId && <p className="text-sm text-red-500">{formErrors.restaurantId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isViewMode}
            />
            </div>

          <div className="space-y-2">
            <Label>Zone Type</Label>
            <Select
              value={zoneType}
              onValueChange={setZoneType}
              disabled={isViewMode}
            >
              <SelectTrigger>
                <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance Based</SelectItem>
                    <SelectItem value="area">Area Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {zoneType === "distance" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDistance">From Distance (km)</Label>
                    <Input
                  id="fromDistance"
                      type="number"
                      value={fromDistance}
                  onChange={(e) => setFromDistance(e.target.value)}
                      disabled={isViewMode}
                    />
                {formErrors.fromDistance && <p className="text-sm text-red-500">{formErrors.fromDistance}</p>}
                  </div>
              <div className="space-y-2">
                <Label htmlFor="toDistance">To Distance (km)</Label>
                    <Input
                  id="toDistance"
                      type="number"
                      value={toDistance}
                  onChange={(e) => setToDistance(e.target.value)}
                      disabled={isViewMode}
                    />
                {formErrors.toDistance && <p className="text-sm text-red-500">{formErrors.toDistance}</p>}
              </div>
                  </div>
              )}

              {zoneType === "area" && (
            <div className="space-y-2">
              <Label>Postcode</Label>
                  <Popover open={openPostcodePopover} onOpenChange={setOpenPostcodePopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPostcodePopover}
                    className="w-full justify-between"
                        disabled={isViewMode}
                      >
                        {selectedPostcode
                          ? `${selectedPostcode.postcode} - ${selectedPostcode.suburb}`
                      : "Select postcode..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search postcode..." 
                          value={postcodeInput}
                          onValueChange={setPostcodeInput}
                        />
                        <CommandList>
                      <CommandEmpty>No postcode found.</CommandEmpty>
                      <CommandGroup>
                        {postcodeOptions.map((option) => (
                                <CommandItem
                                  key={option.id}
                            value={option.postcode}
                                  onSelect={() => {
                                    setSelectedPostcode(option);
                                    setOpenPostcodePopover(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPostcode?.id === option.id 
                                        ? "opacity-100" 
                                        : "opacity-0"
                                    )}
                                  />
                                    {option.postcode} - {option.suburb}
                                </CommandItem>
                        ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
              {formErrors.postcode && <p className="text-sm text-red-500">{formErrors.postcode}</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Delivery Charges</Label>
              {!isViewMode && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addChargeItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Charge
                </Button>
              )}
              </div>
              
              {chargeItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-5 space-y-2">
                  <Label htmlFor={`minOrderAmount_${index}`}>Minimum Order Amount</Label>
                  <Input
                    id={`minOrderAmount_${index}`}
                    type="number"
                      value={item.min_order_amount}
                    onChange={(e) => updateChargeItem(index, 'min_order_amount', e.target.value)}
                      disabled={isViewMode}
                  />
                    {formErrors[`minOrderAmount_${index}`] && (
                    <p className="text-sm text-red-500">{formErrors[`minOrderAmount_${index}`]}</p>
                    )}
                </div>
                
                <div className="col-span-5 space-y-2">
                  <Label htmlFor={`deliveryCharge_${index}`}>Delivery Charge</Label>
                  <Input
                    id={`deliveryCharge_${index}`}
                    type="number"
                      value={item.delivery_charge}
                    onChange={(e) => updateChargeItem(index, 'delivery_charge', e.target.value)}
                      disabled={isViewMode}
                    />
                    {formErrors[`deliveryCharge_${index}`] && (
                    <p className="text-sm text-red-500">{formErrors[`deliveryCharge_${index}`]}</p>
                    )}
                  </div>

                {!isViewMode && chargeItems.length > 1 && (
                  <div className="col-span-2 pt-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChargeItem(index)}
                      >
                      <MinusCircle className="h-4 w-4 text-red-500" />
                      </Button>
                  </div>
                )}
                </div>
              ))}
            </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="active">Active</Label>
              <Switch
              id="active"
                checked={active}
                onCheckedChange={setActive}
                disabled={isViewMode}
              />
            </div>
          </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewMode ? 'Close' : 'Cancel'}
            </Button>
          {!isViewMode && (
            <Button type="submit" onClick={handleSubmit}>
              {mode === 'add' ? 'Create' : 'Update'}
            </Button>
          )}
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
