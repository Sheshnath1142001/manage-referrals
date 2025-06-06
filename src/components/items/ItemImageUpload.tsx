
import { useState } from 'react';
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
    if (!file) {
      console.warn('No file selected');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Log file details before updating form data
    console.log('Selected image file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    // Use FileReader to create preview and verify file is valid
    const reader = new FileReader();
    reader.onload = () => {
      // Set the image in formData
      updateFormField("image", file);
      // Store preview URL
      if (typeof reader.result === 'string') {
        updateFormField("imagePreview", reader.result);
      }
      setIsUploading(false);
      
      // Confirmation log
      console.log('Image successfully added to form data');
    };
    
    reader.onerror = () => {
      console.error('Error reading file:', reader.error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
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
            {formData.imagePreview && (
              <div className="mt-2 flex justify-center">
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  className="h-10 w-auto object-contain"
                />
              </div>
            )}
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
