
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modifier } from "@/types/modifiers";

interface AddEditModifierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (modifier: Modifier, categoryId?: number) => void;
  initialData?: Modifier;
  categories: string[];
  categoriesMap?: Record<string, number>;
  isSubmitting?: boolean;
}

const AddEditModifierDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  categories,
  categoriesMap = {},
  isSubmitting = false,
}: AddEditModifierDialogProps) => {
  const [formData, setFormData] = useState<Modifier>({
    id: "",
    name: "",
    seqNo: 0,
    category: "",
    status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: "",
        name: "",
        seqNo: 0,
        category: "",
        status: "Active",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    const categoryId = categoriesMap[formData.category];
    onSubmit(formData, categoryId);
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: "",
        name: "",
        seqNo: 0,
        category: "",
        status: "Active",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData?.id ? "Edit Modifier" : "Add Modifier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="pt-4">
          {/* INPUTS ROW: Name and Category side by side */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Name field */}
            <div className="flex-1">
              <Label htmlFor="modifier-name" className="mb-1 block">
                Name*
              </Label>
              <Input
                id="modifier-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter modifier name"
                required
                maxLength={255}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            {/* Category field */}
            <div className="flex-1">
              <Label htmlFor="modifier-category" className="mb-1 block">
                Category*
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="modifier-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* STATUS ROW (switch takes full width under form inputs) */}
          <div className="flex items-center justify-start gap-3 mt-4">
            <Switch
              id="modifier-status"
              checked={formData.status === "Active"}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  status: checked ? "Active" : "Inactive",
                })
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="modifier-status" className="mb-0 block">
              Active
            </Label>
          </div>
          {/* BUTTONS ROW */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData?.id ? "Updating..." : "Submitting..."}
                </>
              ) : initialData?.id ? (
                "Update"
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditModifierDialog;
