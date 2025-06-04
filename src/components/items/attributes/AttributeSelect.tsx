
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttributeOption } from "./types";

interface AttributeSelectProps {
  selectedAttribute: string;
  attributeOptions: AttributeOption[];
  onSelect: (value: string) => void;
}

export const AttributeSelect = ({
  selectedAttribute,
  attributeOptions,
  onSelect,
}: AttributeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Select Attribute</Label>
      <Select value={selectedAttribute} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an attribute" />
        </SelectTrigger>
        <SelectContent>
          {attributeOptions.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
