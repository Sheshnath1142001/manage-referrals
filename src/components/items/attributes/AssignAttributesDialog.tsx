import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { AttributeSelect } from "./AttributeSelect";
import { AttributeForm } from "./AttributeForm";
import { AttributeList } from "./AttributeList";
import { AttributeConfig, AttributeOption } from "./types";

interface AssignAttributesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignAttributesDialog = ({
  open,
  onOpenChange,
}: AssignAttributesDialogProps) => {
  const [selectedAttribute, setSelectedAttribute] = useState<string>("");
  const [currentConfig, setCurrentConfig] = useState<AttributeConfig>({
    attributeId: "",
    attributeName: "",
    minSelections: "0",
    maxSelections: "1",
    isActive: true,
    isRequired: false
  });
  const [addedAttributes, setAddedAttributes] = useState<AttributeConfig[]>([]);

  const attributeOptions: AttributeOption[] = [
    { label: "Size", value: "size" },
    { label: "Color", value: "color" },
    { label: "Material", value: "material" },
  ].filter(opt => !addedAttributes.some(attr => attr.attributeId === opt.value));

  const handleAttributeSelect = (value: string) => {
    const attribute = attributeOptions.find(opt => opt.value === value);
    setSelectedAttribute(value);
    setCurrentConfig({
      attributeId: value,
      attributeName: attribute?.label || "",
      minSelections: "0",
      maxSelections: "1",
      isActive: true,
      isRequired: false
    });
  };

  const handleAddAttribute = () => {
    if (currentConfig.attributeId) {
      setAddedAttributes(prev => [...prev, currentConfig]);
      setSelectedAttribute("");
      setCurrentConfig({
        attributeId: "",
        attributeName: "",
        minSelections: "0",
        maxSelections: "1",
        isActive: true,
        isRequired: false
      });
    }
  };

  const removeAttribute = (attributeId: string) => {
    setAddedAttributes(prev => prev.filter(attr => attr.attributeId !== attributeId));
  };

  const toggleEditMode = (attributeId: string) => {
    setAddedAttributes(prev => prev.map(attr => 
      attr.attributeId === attributeId 
        ? { ...attr, isEditing: !attr.isEditing }
        : { ...attr, isEditing: false }
    ));
  };

  const updateAttribute = (attributeId: string, updates: Partial<AttributeConfig>) => {
    setAddedAttributes(prev => prev.map(attr => 
      attr.attributeId === attributeId 
        ? { ...attr, ...updates }
        : attr
    ));
  };

  const handleSubmit = () => {
    console.log('Saving attributes:', addedAttributes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Assign Attributes</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <AttributeSelect
              selectedAttribute={selectedAttribute}
              attributeOptions={attributeOptions}
              onSelect={handleAttributeSelect}
            />

            {selectedAttribute && (
              <AttributeForm
                config={currentConfig}
                onConfigChange={(updates) => setCurrentConfig(prev => ({ ...prev, ...updates }))}
                onAdd={handleAddAttribute}
              />
            )}

            <AttributeList
              attributes={addedAttributes}
              onRemove={removeAttribute}
              onToggleEdit={toggleEditMode}
              onUpdate={updateAttribute}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={addedAttributes.length === 0}
            >
              Save Attributes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
