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

import { DollarSign, Globe, MapPin } from "lucide-react";

interface PriceFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  locations: Array<{ id: number; name: string }>;
}

export const PriceFields = ({
  formData,
  updateFormField,
  isViewMode,
  locations
}: PriceFieldsProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Price Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
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
                  ? locations
                      .filter((loc) =>
                        formData.locations.includes(loc.id.toString())
                      )
                      .map((loc) => loc.name)
                      .join(", ")
                  : "Select locations"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-2">
              <ScrollArea className="h-[200px]">
                {locations.map((location) => {
                  const locationIdStr = location.id.toString();
                  const isChecked = formData.locations.includes(locationIdStr);

                  return (
                    <div
                      key={location.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const updated = isChecked
                          ? formData.locations.filter((id: string) => id !== locationIdStr)
                          : [...formData.locations, locationIdStr];
                        updateFormField("locations", updated);
                      }}
                    >
                      <Checkbox checked={isChecked} />
                      <span>{location.name}</span>
                    </div>
                  );
                })}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};
