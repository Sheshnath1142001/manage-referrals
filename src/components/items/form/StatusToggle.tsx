
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ItemFormData } from "@/components/items/types";

interface StatusToggleProps {
  formData: ItemFormData;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
}

export const StatusToggle = ({
  formData,
  updateFormField,
  isViewMode
}: StatusToggleProps) => {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-3">
      <div className="flex-1">
        <Label htmlFor="status" className="font-medium cursor-pointer text-base">Active</Label>
        <p className="text-sm text-gray-500">Item will be available for purchase when active</p>
      </div>
      <Switch
        id="status"
        checked={formData.status === 1}
        onCheckedChange={(checked) => updateFormField("status", checked ? 1 : 0)}
        disabled={isViewMode}
      />
    </div>
  );
};
