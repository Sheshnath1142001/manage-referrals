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
}

export const BasicInfoFields = ({
  formData,
  updateFormField,
  isViewMode,
  categories,
  allCategories,
}: BasicInfoFieldsProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          General Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              {allCategories.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id.toString()}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {category.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
      </CardContent>
    </Card>
  );
};
