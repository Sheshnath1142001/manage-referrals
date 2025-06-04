import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuantityFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  quantityUnits: Array<{id: number, unit: string}>;
}

export const QuantityFields = ({
  formData,
  updateFormField,
  isViewMode,
  quantityUnits,
}: QuantityFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity*</Label>
        <Input
          id="quantity"
          type="number"
          min="0"
          step="1"
          value={formData.quantity}
          onChange={(e) => updateFormField('quantity', e.target.value)}
          disabled={isViewMode}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity_unit_id">Quantity Unit*</Label>
        <Select
          value={formData.quantity_unit_id?.toString()}
          onValueChange={(value) => updateFormField('quantity_unit_id', parseInt(value))}
          disabled={isViewMode}
        >
          <SelectTrigger>
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
  );
};