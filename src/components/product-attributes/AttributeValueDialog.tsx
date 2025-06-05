import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AttributeValue } from "@/types/productAttributes";
import { UseMutationResult } from "@tanstack/react-query";
import { X } from "lucide-react";

interface AttributeValueDialogProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: Partial<AttributeValue>;
  onFormDataChange: (data: Partial<AttributeValue>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  mutation: UseMutationResult<any, unknown, any, unknown>;
}

export function AttributeValueDialog({
  isOpen,
  isEditing,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
  mutation
}: AttributeValueDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Value" : "Add New Value"}
          </DialogTitle>
        </DialogHeader>

        <form id="attribute-value-form" onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Value</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
                  placeholder="Enter value"
                  className="h-9"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm font-medium">Display Value</Label>
                <Input
                  id="display_name"
                  value={formData.display_name || ""}
                  onChange={(e) => onFormDataChange({...formData, display_name: e.target.value})}
                  placeholder="Enter display value"
                  className="h-9"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="base_price" className="text-sm font-medium">Base Price</Label>
              <Input
                id="base_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_price || 0}
                onChange={(e) => onFormDataChange({...formData, base_price: parseFloat(e.target.value)})}
                placeholder="Enter price"
                className="h-9"
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label className="text-base">Active</Label>
              </div>
              <Switch
                checked={formData.status === 1}
                onCheckedChange={(checked) => onFormDataChange({...formData, status: checked ? 1 : 0})}
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label className="text-base">Default</Label>
                <p className="text-sm text-muted-foreground">
                  Set as default value
                </p>
              </div>
              <Switch
                checked={formData.is_default === 1}
                onCheckedChange={(checked) => onFormDataChange({...formData, is_default: checked ? 1 : 0})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose} className="h-9">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="h-9"
              >
                {isEditing ? "Save Changes" : "Create Value"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
