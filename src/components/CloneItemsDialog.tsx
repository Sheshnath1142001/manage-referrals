
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CloneItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: string[];
  onSubmit?: (sourceLocation: string, targetLocation: string, items: number[]) => void;
}

const CloneItemsDialog = ({ open, onOpenChange, locations, onSubmit }: CloneItemsDialogProps) => {
  const [fromLocation, setFromLocation] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");
  const { toast } = useToast();

  const handleClone = () => {
    if (!fromLocation || !toLocation) {
      toast({
        title: "Error",
        description: "Please select both locations",
        variant: "destructive",
      });
      return;
    }

    if (fromLocation === toLocation) {
      toast({
        title: "Error",
        description: "From and To locations cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (onSubmit) {
      // For demo purposes we're using empty items array
      // In a real implementation, you'd pass the selected items
      onSubmit(fromLocation, toLocation, []);
    } else {
      toast({
        title: "Cloning Items",
        description: `Cloning items from ${fromLocation} to ${toLocation}`,
      });
      // Close the dialog after successful action
      onOpenChange(false);
    }
    
    // Reset form values
    setFromLocation("");
    setToLocation("");
  };

  const handleReset = () => {
    setFromLocation("");
    setToLocation("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-black text-white p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">Clone Location Items</DialogTitle>
            <DialogClose className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1" style={{ paddingBottom: "calc(4rem + 1px)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-semibold flex">
                From Location
                <span className="text-red-500">*</span>:
              </label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(loc => loc !== "All Locations").map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="font-semibold flex">
                To Location
                <span className="text-red-500">*</span>:
              </label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(loc => loc !== "All Locations").map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center gap-4 w-full">
            <Button 
              type="button" 
              className="bg-black hover:bg-black/80 text-white font-semibold px-8 py-2"
              onClick={handleClone}
            >
              CLONE
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="border-black text-black font-semibold px-8 py-2"
              onClick={handleReset}
            >
              RESET
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloneItemsDialog;
