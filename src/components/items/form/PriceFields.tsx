
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Globe, MapPin } from "lucide-react";

interface PriceFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  locations: Array<{id: number, name: string}>;
}

export const PriceFields = ({
  formData,
  updateFormField,
  isViewMode,
  locations,
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
                updateFormField("online_price", price); // mirror store price to online price
              }}
              className="pl-7 border-gray-200 focus:border-primary focus:ring-primary"
              placeholder="0.00"
              disabled={isViewMode}
              required
              placeholder="0.00"
            />
          </div>
        </div>

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
              onChange={(e) => updateFormField('online_price', e.target.value)}
              className="pl-7 border-gray-200 focus:border-primary focus:ring-primary"
              placeholder="0.00"
              disabled={isViewMode}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locations" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Available Locations*
          </Label>
          <Select
            value={formData.locations?.join(',')}
            onValueChange={(value) => updateFormField('locations', value.split(','))}
            disabled={isViewMode}
          >
            <SelectTrigger className="border-gray-200 focus:ring-primary">
              <SelectValue placeholder="Select locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Locations">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem 
                  key={location.id} 
                  value={location.id.toString()}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
