import React from "react";
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

interface UpdateModifierDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modifier: {
    id: string;
    modifier: string;
    price: string;
    online_price: string;
    status: number;
  };
  onSubmit: (data: { price: string; online_price: string; status: number }) => void;
}

export function UpdateModifierDialog({
  isOpen,
  onOpenChange,
  modifier,
  onSubmit
}: UpdateModifierDialogProps) {
  const [price, setPrice] = React.useState(modifier.price);
  const [onlinePrice, setOnlinePrice] = React.useState(modifier.online_price);
  const [isActive, setIsActive] = React.useState(modifier.status === 1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setPrice(modifier.price);
    setOnlinePrice(modifier.online_price);
    setIsActive(modifier.status === 1);
  }, [modifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        price: price.toString(),
        online_price: onlinePrice.toString(),
        status: isActive ? 1 : 0
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPrice(modifier.price);
    setOnlinePrice(modifier.online_price);
    setIsActive(modifier.status === 1);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setPrice(value);
    }
  };

  const handleOnlinePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setOnlinePrice(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update {modifier.modifier}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price*</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={handlePriceChange}
                placeholder="Enter price"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="online-price">Online Price*</Label>
              <Input
                id="online-price"
                type="number"
                min="0"
                step="0.01"
                value={onlinePrice}
                onChange={handleOnlinePriceChange}
                placeholder="Enter online price"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              disabled={isSubmitting}
            >
              RESET
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !price || !onlinePrice}
            >
              {isSubmitting ? "UPDATING..." : "SUBMIT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 