import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ItemImageUpload } from "../ItemImageUpload";
import { ItemImage } from "../ItemImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DescriptionSectionProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  editingItem?: any;
}

export const DescriptionSection = ({
  formData,
  updateFormField,
  isViewMode,
  editingItem
}: DescriptionSectionProps) => {
  const [isEditingImage, setIsEditingImage] = useState(false);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Item Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 space-y-2">
            <Label 
              htmlFor="description" 
              className="text-sm font-medium flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-gray-500" />
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormField("description", e.target.value)}
              disabled={isViewMode}
              placeholder={isViewMode ? "No description available" : "Enter item description"}
              className="min-h-[200px] resize-none border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              {isViewMode ? "Item Image" : "Upload Image"}
            </Label>
            <div className="border rounded-lg overflow-hidden bg-gray-50 h-[200px] flex items-center justify-center relative group">
              {!isViewMode && editingItem && !isEditingImage ? (
                <>
                  <div className="w-full h-full">
                    <ItemImage 
                      moduleId={editingItem.id} 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsEditingImage(true)}
                    >
                      <PencilIcon className="h-4 w-4" />
                      Change Image
                    </Button>
                  </div>
                </>
              ) : isViewMode && editingItem ? (
                <div className="w-full h-full">
                  <ItemImage 
                    moduleId={editingItem.id} 
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-full h-full">
                  <ItemImageUpload
                    formData={formData}
                    updateFormField={updateFormField}
                    isViewMode={isViewMode}
                  />
                </div>
              )}
            </div>
            {!isViewMode && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
                {isEditingImage && editingItem && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsEditingImage(false)}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
