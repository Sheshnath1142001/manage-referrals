
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ItemImageUploadProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
}

export const ItemImageUpload = ({
  formData,
  updateFormField,
  isViewMode
}: ItemImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);
      updateFormField("image", file);
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-4 h-32 flex flex-col items-center justify-center 
          ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 transition-colors cursor-pointer'}`}
        onClick={() => !isViewMode && !isUploading && document.getElementById('image-upload')?.click()}
      >
        {isUploading ? (
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : formData.image ? (
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-1">{formData.image.name}</p>
            <p className="text-xs text-gray-500">
              {(formData.image.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="h-6 w-6 text-gray-400" />
            <div className="text-sm text-gray-500">
              {isViewMode ? 'No image uploaded' : 'Click to upload image'}
            </div>
            {!isViewMode && (
              <div className="text-xs text-gray-400">
                Max size: 5MB
              </div>
            )}
          </div>
        )}
      </div>
      {!isViewMode && (
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isViewMode || isUploading}
        />
      )}
    </div>
  );
};
