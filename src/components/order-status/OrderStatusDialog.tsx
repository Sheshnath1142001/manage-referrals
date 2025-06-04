
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: {
    id?: number;
    customLabel: string;
    description: string;
  };
  onSubmit?: (data: { customLabel: string; description: string }) => void;
  isSubmitting?: boolean;
}

export function OrderStatusDialog({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: OrderStatusDialogProps) {
  const [customLabel, setCustomLabel] = React.useState(initialData?.customLabel || "");
  const [description, setDescription] = React.useState(initialData?.description || "");

  React.useEffect(() => {
    setCustomLabel(initialData?.customLabel || "");
    setDescription(initialData?.description || "");
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ customLabel, description });
    }
  };

  const handleReset = () => {
    setCustomLabel("");
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Add Order Status" : "Edit Order Status"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="custom-label">Custom Label*</Label>
            <Input
              id="custom-label"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Custom Label"
              required
              maxLength={255}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              maxLength={1024}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              RESET
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              SUBMIT
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
