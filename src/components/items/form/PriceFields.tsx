import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

import { DollarSign, Globe, MapPin } from "lucide-react";

interface PriceFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  locations: Array<{ id: number; name: string; status: number }>;
}

export const PriceFields = ({
  formData,
  updateFormField,
  isViewMode,
  locations
}: PriceFieldsProps) => {
  // Auto-select first location only in create mode (not in edit/view mode)
  useEffect(() => {
    if (!isViewMode && locations.length > 0 && (!formData.locations || formData.locations.length === 0)) {
      // Only set default location if we're creating a new item (no existing data)
      const isCreateMode = !formData.name || formData.name === "";
      if (isCreateMode) {
        // Find first active location (status = 1)
        const firstActiveLocation = locations.find(location => location.status === 1);
        if (firstActiveLocation) {
          updateFormField("locations", [firstActiveLocation.id.toString()]);
        }
      }
    }
  }, [locations, formData.locations, formData.name, isViewMode, updateFormField]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Price Information
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* 3 Columns Layout: Store Price, Online Price, Available Locations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Store Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              Store Price*
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  const price = e.target.value;
                  updateFormField("price", price);
                  updateFormField("online_price", price); // mirror price
                }}
                className="pl-7 border-gray-200 focus:border-primary focus:ring-primary"
                placeholder="0.00"
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          {/* Online Price */}
          <div className="space-y-2">
            <Label htmlFor="online_price" className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              Online Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="online_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.online_price}
                onChange={(e) => updateFormField("online_price", e.target.value)}
                className="pl-7 border-gray-200 focus:border-primary focus:ring-primary"
                placeholder="0.00"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Available Locations (Multi-Select) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              Available Locations*
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between border-gray-200",
                    !formData.locations?.length && "text-muted-foreground"
                  )}
                  disabled={isViewMode}
                >
                  {formData.locations?.length
                    ? (() => {
                        const selectedLocations = locations.filter((loc) =>
                          formData.locations.includes(loc.id.toString())
                        );
                        
                        if (selectedLocations.length <= 2) {
                          return selectedLocations.map((loc) => loc.name).join(", ");
                        } else {
                          const firstLocation = selectedLocations[0].name;
                          const remainingCount = selectedLocations.length - 1;
                          return `${firstLocation} +${remainingCount} more`;
                        }
                      })()
                    : "Select locations"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[300px] p-2">
                <ScrollArea className="h-[200px]">
                  {locations.map((location) => {
                    const locationIdStr = location.id.toString();
                    const isChecked = formData.locations.includes(locationIdStr);
                    const isDisabled = location.status === 0; // Disable if status is 0

                    return (
                      <div
                        key={location.id}
                        className={`flex items-center gap-2 p-2 rounded-md ${
                          isDisabled 
                            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                            : 'hover:bg-muted cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isDisabled) {
                            const updated = isChecked
                              ? formData.locations.filter((id: string) => id !== locationIdStr)
                              : [...formData.locations, locationIdStr];
                            updateFormField("locations", updated);
                          }
                        }}
                      >
                        <Checkbox 
                          checked={isChecked} 
                          disabled={isDisabled}
                        />
                        <span className={isDisabled ? 'text-gray-400' : ''}>
                          {location.name}
                          {isDisabled && (
                            <span className="text-xs text-gray-400 ml-1">(Inactive)</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
