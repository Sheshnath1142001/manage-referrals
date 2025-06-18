import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useRef } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  onImageDelete?: () => Promise<void>;
  imagePreview: string | null;
  disabled?: boolean;
  showDelete?: boolean;
}

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  onImageDelete,
  imagePreview, 
  disabled,
  showDelete 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      onImageSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  const handleDeleteImage = async () => {
    if (onImageDelete) {
      await onImageDelete();
      handleRemoveImage();
    }
  };

  return (
    <div className="space-y-4">
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {imagePreview ? (
        <div className="relative">
          <div className="w-full max-w-xs">
            <img
              src={imagePreview}
              alt="Category preview"
              className="w-full h-32 object-cover rounded-lg border"
            />
            {!disabled && (
              <div className="absolute top-2 right-2 flex gap-2">
                {showDelete && onImageDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleDeleteImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Drop an image here, or click to select
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  );
} 