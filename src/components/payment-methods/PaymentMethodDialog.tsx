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
import { Textarea } from "@/components/ui/textarea";
import { paymentMethodsService } from "@/services/api/items/paymentMethods";
import { useToast } from "@/components/ui/use-toast";
import type { PaymentMethod } from "@/hooks/usePaymentMethods";

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: PaymentMethod;
  onSuccess?: () => void;
}

export function PaymentMethodDialog({ isOpen, onClose, mode, initialData, onSuccess }: PaymentMethodDialogProps) {
  const [method, setMethod] = React.useState(initialData?.method || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [isActive, setIsActive] = React.useState(initialData?.status === 1 || !initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setMethod(initialData?.method || "");
    setDescription(initialData?.description || "");
    setIsActive(initialData?.status === 1 || !initialData);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        method,
        description,
        status: isActive ? 1 : 0
      };

      if (mode === "add") {
        await paymentMethodsService.createPaymentMethod(data);
        toast({
          title: "Success",
          description: "Payment method created successfully",
        });
      } else if (mode === "edit" && initialData?.id) {
        await paymentMethodsService.updatePaymentMethod({
          id: initialData.id,
          ...data
        });
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to save payment method. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMethod("");
    setDescription("");
    setIsActive(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Add Payment Method" : "Edit Payment Method"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method-name">Method Name*</Label>
              <Input
                id="method-name"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                placeholder="Enter method name"
                required
                maxLength={255}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                disabled={isSubmitting}
              />
            </div>

            {mode === "edit" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
              RESET
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
