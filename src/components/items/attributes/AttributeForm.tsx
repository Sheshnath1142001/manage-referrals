
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { AttributeConfig } from "./types";

interface AttributeFormProps {
  config: AttributeConfig;
  onConfigChange: (updates: Partial<AttributeConfig>) => void;
  onAdd: () => void;
}

export const AttributeForm = ({
  config,
  onConfigChange,
  onAdd,
}: AttributeFormProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Minimum Selections</Label>
          <Input
            type="number"
            value={config.minSelections}
            onChange={(e) => onConfigChange({ minSelections: e.target.value })}
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Maximum Selections</Label>
          <Input
            type="number"
            value={config.maxSelections}
            onChange={(e) => onConfigChange({ maxSelections: e.target.value })}
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Active</Label>
          <Switch
            checked={config.isActive}
            onCheckedChange={(checked) => onConfigChange({ isActive: checked })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Required</Label>
          <Switch
            checked={config.isRequired}
            onCheckedChange={(checked) => onConfigChange({ isRequired: checked })}
          />
        </div>
      </div>

      <Button 
        onClick={onAdd}
        className="w-full"
        disabled={!config.attributeId}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Attribute
      </Button>
    </div>
  );
};
