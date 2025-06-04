import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { quantityUnitsService } from "@/services/api/items/quantityUnits";
import { useToast } from "@/components/ui/use-toast";

interface QuantityUnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  initialData?: {
    id?: number;
    unit: string;
    status: number;
  };
  onSuccess?: () => void;
}

export function QuantityUnitDialog({ isOpen, onClose, mode, initialData, onSuccess }: QuantityUnitDialogProps) {
  const [unit, setUnit] = React.useState(initialData?.unit || "");
  const [isActive, setIsActive] = React.useState(initialData?.status === 1 || !initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setUnit(initialData?.unit || "");
    setIsActive(initialData?.status === 1 || !initialData);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        unit,
        status: isActive ? 1 : 0
      };

      if (mode === "add") {
        await quantityUnitsService.createQuantityUnit(data);
        toast({
          title: "Success",
          description: "Quantity unit created successfully",
        });
      } else if (mode === "edit" && initialData?.id) {
        await quantityUnitsService.updateQuantityUnit({
          id: initialData.id,
          ...data
        });
        toast({
          title: "Success",
          description: "Quantity unit updated successfully",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving quantity unit:', error);
      toast({
        title: "Error",
        description: "Failed to save quantity unit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUnit("");
    setIsActive(true);
  };

  const isViewMode = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Add Quantity Unit" : mode === "edit" ? "Edit Quantity Unit" : "View Quantity Unit"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={isViewMode ? (e) => { e.preventDefault(); onClose(); } : handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="unit-name">Name*</Label>
            <Input
              id="unit-name"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Enter unit name"
              required
              maxLength={255}
              autoFocus
              disabled={isSubmitting || isViewMode}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSubmitting || isViewMode}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            {isViewMode ? (
              <Button type="button" onClick={onClose}>
                CLOSE
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                  RESET
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
