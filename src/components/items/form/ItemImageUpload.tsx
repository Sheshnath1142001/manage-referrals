import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import axios from 'axios';

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
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (formData.imagePreview && formData.imageToken) {
      loadImage();
    }
  }, [formData.imagePreview, formData.imageToken]);

  const loadImage = async () => {
    try {
      const response = await axios.get(formData.imagePreview, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${formData.imageToken}`
        }
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setImageError(false);
    } catch (error) {
      console.error('Error loading image:', error);
      setImageError(true);
    }
  };

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
      
      // Create a preview URL for the new image
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormField("imagePreview", reader.result as string);
        updateFormField("image", file);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (isViewMode) return;
    updateFormField("image", null);
    updateFormField("imagePreview", "");
    setImageUrl(null);
    setImageError(false);
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="space-y-2 h-full">
      <Label htmlFor="image">Item Image</Label>
      <div 
        className={`border-2 border-dashed rounded-lg p-4 h-[152px] flex flex-col items-center justify-center 
          ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 transition-colors cursor-pointer'}`}
        onClick={() => !isViewMode && !isUploading && document.getElementById('image-upload')?.click()}
      >
        {isUploading ? (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : imageUrl && !imageError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt="Item preview" 
              className="max-w-full max-h-full object-contain"
            />
            {!isViewMode && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
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
