
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { AttributeForm } from "./AttributeForm";
import { AttributeConfig } from "./types";

interface AttributeListProps {
  attributes: AttributeConfig[];
  onRemove: (attributeId: string) => void;
  onToggleEdit: (attributeId: string) => void;
  onUpdate: (attributeId: string, updates: Partial<AttributeConfig>) => void;
}

export const AttributeList = ({
  attributes,
  onRemove,
  onToggleEdit,
  onUpdate,
}: AttributeListProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Available Attributes</h3>
      <div className="space-y-2">
        {attributes.map((attr) => (
          <div 
            key={attr.attributeId}
            className="flex flex-col p-4 border rounded-md bg-gray-50 space-y-3"
          >
            {attr.isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{attr.attributeName}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onToggleEdit(attr.attributeId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <AttributeForm
                  config={attr}
                  onConfigChange={(updates) => onUpdate(attr.attributeId, updates)}
                  onAdd={() => {}}
                />

                <Button 
                  onClick={() => onToggleEdit(attr.attributeId)}
                  className="w-full mt-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{attr.attributeName}</p>
                  <p className="text-sm text-gray-500">
                    Min: {attr.minSelections}, Max: {attr.maxSelections}
                  </p>
                  <p className="text-sm text-gray-500">
                    {attr.isActive ? 'Active' : 'Inactive'} • 
                    {attr.isRequired ? ' Required' : ' Optional'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onToggleEdit(attr.attributeId)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemove(attr.attributeId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {attributes.length === 0 && (
          <p className="text-gray-500 text-center py-2">No attributes added yet</p>
        )}
      </div>
    </div>
  );
};
