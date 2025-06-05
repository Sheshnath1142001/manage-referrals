
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProductAttribute, AttributeType } from "@/types/productAttributes";
import { UseMutationResult } from "@tanstack/react-query";

interface AttributeDialogProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: Partial<ProductAttribute>;
  onFormDataChange: (data: Partial<ProductAttribute>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  mutation: UseMutationResult<any, unknown, any, unknown>;
  isViewMode?: boolean;
}

export function AttributeDialog({
  isOpen,
  isEditing,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
  mutation,
  isViewMode = false
}: AttributeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isViewMode 
              ? "View Attribute" 
              : isEditing 
                ? "Edit Attribute" 
                : "Add New Attribute"}
          </DialogTitle>
        </DialogHeader>

        <form id="attribute-form" onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
                  placeholder="Enter attribute name"
                  className="h-9"
                  required
                  disabled={isViewMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name || ""}
                  onChange={(e) => onFormDataChange({...formData, display_name: e.target.value})}
                  placeholder="Enter display name"
                  className="h-9"
                  required
                  disabled={isViewMode}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type</Label>
                <Select
                  value={formData.attribute_type as string}
                  onValueChange={(value) => onFormDataChange({...formData, attribute_type: value as AttributeType})}
                  disabled={isViewMode}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="single_select">Single select</SelectItem>
                    <SelectItem value="multi_select">Multiple select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={String(formData.status || "Active")}
                  onValueChange={(value) => onFormDataChange({...formData, status: value as "Active" | "Inactive"})}
                  disabled={isViewMode}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_selections" className="text-sm font-medium">Min Selections</Label>
                <Input
                  id="min_selections"
                  type="number"
                  min="0"
                  value={formData.min_selections || 0}
                  onChange={(e) => onFormDataChange({...formData, min_selections: parseInt(e.target.value)})}
                  placeholder="Enter minimum"
                  className="h-9"
                  required
                  disabled={isViewMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_selections" className="text-sm font-medium">Max Selections</Label>
                <Input
                  id="max_selections"
                  type="number"
                  min="1"
                  value={formData.max_selections || 1}
                  onChange={(e) => onFormDataChange({...formData, max_selections: parseInt(e.target.value)})}
                  placeholder="Enter maximum"
                  className="h-9"
                  required
                  disabled={isViewMode}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label className="text-base">Required</Label>
                <p className="text-sm text-muted-foreground">
                  Make this attribute mandatory
                </p>
              </div>
              <Switch
                checked={!!formData.is_required}
                onCheckedChange={(checked) => onFormDataChange({...formData, is_required: checked})}
                disabled={isViewMode}
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
                {isViewMode 
                  ? "Close" 
                  : isEditing 
                    ? "Save Changes" 
                    : "Create Attribute"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
