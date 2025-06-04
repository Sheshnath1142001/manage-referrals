
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Globe, Tag } from "lucide-react";

interface DiscountFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  discountTypes: Array<{id: number, type: string}>;
}

export const DiscountFields = ({
  formData,
  updateFormField,
  isViewMode,
  discountTypes,
}: DiscountFieldsProps) => {
  const isPercentageDiscount = formData.discount_type_id === 2;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Discount Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="discount_type_id" className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-500" />
            Discount Type
          </Label>
          <Select
            value={formData.discount_type_id?.toString()}
            onValueChange={(value) => updateFormField('discount_type_id', parseInt(value))}
            disabled={isViewMode}
          >
            <SelectTrigger className="border-gray-200 focus:ring-primary">
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              {discountTypes.map((type) => (
                <SelectItem 
                  key={type.id} 
                  value={type.id.toString()}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {type.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount" className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            Store Discount
          </Label>
          <div className="relative">
            {isPercentageDiscount && (
              <span className="absolute right-3 top-2.5 text-gray-500">%</span>
            )}
            {!isPercentageDiscount && (
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            )}
            <Input
              id="discount"
              type="number"
              min="0"
              step={isPercentageDiscount ? "1" : "0.01"}
              max={isPercentageDiscount ? "100" : undefined}
              value={formData.discount}
              onChange={(e) => updateFormField('discount', e.target.value)}
              className={`border-gray-200 focus:border-primary focus:ring-primary ${!isPercentageDiscount ? 'pl-7' : 'pr-7'}`}
              placeholder={isPercentageDiscount ? "0-100" : "0.00"}
              disabled={isViewMode}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="online_discount" className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            Online Discount
          </Label>
          <div className="relative">
            {isPercentageDiscount && (
              <span className="absolute right-3 top-2.5 text-gray-500">%</span>
            )}
            {!isPercentageDiscount && (
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            )}
            <Input
              id="online_discount"
              type="number"
              min="0"
              step={isPercentageDiscount ? "1" : "0.01"}
              max={isPercentageDiscount ? "100" : undefined}
              value={formData.online_discount}
              onChange={(e) => updateFormField('online_discount', e.target.value)}
              className={`border-gray-200 focus:border-primary focus:ring-primary ${!isPercentageDiscount ? 'pl-7' : 'pr-7'}`}
              placeholder={isPercentageDiscount ? "0-100" : "0.00"}
              disabled={isViewMode}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
