import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Barcode, Store } from "lucide-react";

interface BasicInfoFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  categories: Array<{id: number, category: string}>;
  allCategories: Array<{id: number, category: string}>;
  quantityUnits: Array<{id: number, unit: string}>;
}

export const BasicInfoFields = ({
  formData,
  updateFormField,
  isViewMode,
  categories,
  allCategories,
  quantityUnits,
}: BasicInfoFieldsProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          General Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* First Row: 3 columns - Item Name, Category, Barcode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              Item Name*
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              disabled={isViewMode}
              required
              placeholder="Enter item name"
              className="border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              Category*
            </Label>
            <Select
              value={formData.category_id?.toString()}
              onValueChange={(value) => updateFormField('category_id', value)}
              disabled={isViewMode}
            >
              <SelectTrigger className="border-gray-200 focus:ring-primary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                 {Array.isArray(allCategories) ? allCategories.map((category: any) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id.toString()}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    {category.category}
                  </SelectItem>
                )): null}
              </SelectContent>
            </Select>
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode" className="text-sm font-medium flex items-center gap-2">
              <Barcode className="h-4 w-4 text-gray-500" />
              Barcode
            </Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => updateFormField('barcode', e.target.value)}
              disabled={isViewMode}
              placeholder="Enter barcode"
              className="border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity*
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={(e) => updateFormField('quantity', e.target.value)}
              disabled={isViewMode}
              required
              className="border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Quantity Unit */}
          <div className="space-y-2">
            <Label htmlFor="quantity_unit_id" className="text-sm font-medium">
              Quantity Unit*
            </Label>
            <Select
              value={formData.quantity_unit_id?.toString()}
              onValueChange={(value) => updateFormField('quantity_unit_id', parseInt(value))}
              disabled={isViewMode}
            >
              <SelectTrigger className="border-gray-200 focus:ring-primary">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {quantityUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
