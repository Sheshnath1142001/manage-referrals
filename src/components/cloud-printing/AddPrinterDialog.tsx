
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface AddPrinterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPrinterDialog({ isOpen, onClose }: AddPrinterDialogProps) {
  const [printerName, setPrinterName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [serialNumber, setSerialNumber] = React.useState("");
  const [voiceType, setVoiceType] = React.useState("");
  const [orderTypes, setOrderTypes] = React.useState("");
  const [printOrders, setPrintOrders] = React.useState(false);
  const [announceOrders, setAnnounceOrders] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    onClose();
  };

  const handleReset = () => {
    setPrinterName("");
    setLocation("");
    setSerialNumber("");
    setVoiceType("");
    setOrderTypes("");
    setPrintOrders(false);
    setAnnounceOrders(false);
    setIsActive(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add Cloud Printer</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="printerName">Add Cloud Printer*</Label>
              <Input
                id="printerName"
                value={printerName}
                onChange={(e) => setPrinterName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location1">Location 1</SelectItem>
                  <SelectItem value="location2">Location 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number*</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voiceType">Voice Type*</Label>
              <Select value={voiceType} onValueChange={setVoiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Voice Type 1</SelectItem>
                  <SelectItem value="2">Voice Type 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderTypes">Order Types*</Label>
              <Select value={orderTypes} onValueChange={setOrderTypes}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type1">Order Type 1</SelectItem>
                  <SelectItem value="type2">Order Type 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="printOrders">Print Orders</Label>
              <Switch
                id="printOrders"
                checked={printOrders}
                onCheckedChange={setPrintOrders}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="announceOrders">Announce Orders</Label>
              <Switch
                id="announceOrders"
                checked={announceOrders}
                onCheckedChange={setAnnounceOrders}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
