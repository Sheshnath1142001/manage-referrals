
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Modifier {
  name: string;
  price: string;
}

interface ModifierGroup {
  sauceOptions: Modifier[];
  extras: Modifier[];
}

interface AddModifiersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  existingModifiers?: ModifierGroup;
  onSubmit?: (modifiers: any) => void;
}

const AddModifiersDialog = ({
  open,
  onOpenChange,
  itemName,
  existingModifiers,
  onSubmit
}: AddModifiersDialogProps) => {
  const [availableModifiers, setAvailableModifiers] = useState(true);
  const [modifierCategory, setModifierCategory] = useState("");
  const [modifier, setModifier] = useState("");
  const [price, setPrice] = useState("");
  const [onlinePrice, setOnlinePrice] = useState("");
  const [halfPrice, setHalfPrice] = useState("");
  const [onlineHalfPrice, setOnlineHalfPrice] = useState("");

  const initialModifiers: ModifierGroup = existingModifiers || {
    sauceOptions: [
      { name: "Classic Tomato Sauce", price: "P- $1 / $1 , HP- $ / $" },
      { name: "Garlic Butter Sauce", price: "P- $2 / $2 , HP- $ / $" },
      { name: "White Cream Sauce", price: "P- $2 / $2 , HP- $ / $" }
    ],
    extras: [
      { name: "Beef Pattie", price: "P- $2 / $2 , HP- $ / $" },
      { name: "Beetroot", price: "P- $1 / $1 , HP- $ / $" },
      { name: "Cheese", price: "P- $2 / $2 , HP- $ / $" },
      { name: "Lettuce", price: "P- $2 / $2 , HP- $ / $" },
      { name: "Onion", price: "P- $1 / $1 , HP- $ / $" }
    ]
  };
  
  const [modifiers, setModifiers] = useState<ModifierGroup>(initialModifiers);

  useEffect(() => {
    if (existingModifiers) {
      setModifiers(existingModifiers);
    } else {
      setModifiers(initialModifiers);
    }
    setModifierCategory("");
    setModifier("");
    setPrice("");
    setOnlinePrice("");
    setHalfPrice("");
    setOnlineHalfPrice("");
  }, [open, existingModifiers]);

  const handleAddModifier = () => {
    if (!modifierCategory || !modifier || !price) {
      return;
    }

    const newModifier = {
      name: modifier,
      price: `P- ${price} , HP- ${halfPrice}`
    };

    if (modifierCategory === "Sauce") {
      setModifiers(prev => ({
        ...prev,
        sauceOptions: [...prev.sauceOptions, newModifier]
      }));
    } else if (modifierCategory === "Extra") {
      setModifiers(prev => ({
        ...prev,
        extras: [...prev.extras, newModifier]
      }));
    }

    setModifier("");
    setPrice("");
    setOnlinePrice("");
    setHalfPrice("");
    setOnlineHalfPrice("");
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(modifiers);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-black text-white p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">{itemName}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto flex-1" style={{ paddingBottom: "calc(4rem + 1px)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Available Modifiers</h3>
            <Switch 
              checked={availableModifiers} 
              onCheckedChange={setAvailableModifiers}
              className="data-[state=checked]:bg-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sauce-options" className="font-semibold text-base">
              Sauce Options:
            </Label>
            <div className="flex flex-wrap gap-2">
              {modifiers.sauceOptions.map((sauce, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-black text-black rounded-full px-4 py-1 text-sm"
                >
                  {sauce.name} ({sauce.price})
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extras" className="font-semibold text-base">
              ADD EXTRAS?:
            </Label>
            <div className="flex flex-wrap gap-2">
              {modifiers.extras.map((extra, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-black text-black rounded-full px-4 py-1 text-sm"
                >
                  {extra.name} ({extra.price})
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <h3 className="text-xl font-semibold">Add Modifiers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modifier-category" className="text-sm font-medium">
                Modifier Category*
              </Label>
              <Select 
                value={modifierCategory} 
                onValueChange={setModifierCategory}
              >
                <SelectTrigger id="modifier-category" className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sauce">Sauce</SelectItem>
                  <SelectItem value="Extra">Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="modifier" className="text-sm font-medium">
                Modifier*
              </Label>
              <Select 
                value={modifier} 
                onValueChange={setModifier}
              >
                <SelectTrigger id="modifier" className="mt-1">
                  <SelectValue placeholder="Select modifier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tomato Sauce">Tomato Sauce</SelectItem>
                  <SelectItem value="Mayo">Mayo</SelectItem>
                  <SelectItem value="Cheese">Cheese</SelectItem>
                  <SelectItem value="Lettuce">Lettuce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                Price*
              </Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="online-price" className="text-sm font-medium">
                Online Price
              </Label>
              <Input
                id="online-price"
                value={onlinePrice}
                onChange={(e) => setOnlinePrice(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="half-price" className="text-sm font-medium">
                Half Price*
              </Label>
              <Input
                id="half-price"
                value={halfPrice}
                onChange={(e) => setHalfPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="online-half-price" className="text-sm font-medium">
                Online Half Price
              </Label>
              <Input
                id="online-half-price"
                value={onlineHalfPrice}
                onChange={(e) => setOnlineHalfPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-black hover:bg-black/80 text-white h-10 w-10 rounded-md"
              onClick={handleAddModifier}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center w-full">
            <Button
              type="button"
              className="bg-black hover:bg-black/80 text-white px-8 py-2 rounded-md"
              onClick={handleSubmit}
            >
              ADD MODIFIERS
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddModifiersDialog;
