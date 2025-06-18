import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ItemImageUpload } from "./ItemImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon } from "lucide-react";

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
  const maxDescriptionLength = 300;

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxDescriptionLength) {
      updateFormField("description", value);
    }
  };

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
              onChange={handleDescriptionChange}
              disabled={isViewMode}
              placeholder={isViewMode ? "No description available" : "Enter item description"}
              className="min-h-[200px] resize-none border-gray-200 focus:border-primary focus:ring-primary"
            />
            {!isViewMode && (
              <p className={`text-xs mt-1 ${formData.description.length >= maxDescriptionLength ? "text-red-500" : "text-gray-500"}`}>
                {formData.description.length}/{maxDescriptionLength} characters
              </p>
            )}
          </div>
          
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              {isViewMode ? "Item Image" : "Upload Image"}
            </Label>
            <div className="h-[200px]">
              <ItemImageUpload
                formData={formData}
                updateFormField={updateFormField}
                isViewMode={isViewMode}
                editingItem={editingItem}
              />
            </div>
            
            {!isViewMode && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
