import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dealsApi } from "@/services/api/deals";

interface DealImageUploadProps {
  dealId?: number;
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted: () => void;
}

export const DealImageUpload = ({
  dealId,
  initialImageUrl,
  onImageUploaded,
  onImageDeleted,
}: DealImageUploadProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create a temporary URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
    setSelectedFile(file);
  };

  const uploadImage = async () => {
    if (!selectedFile || !dealId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('module_type', 'deal');
      formData.append('module_id', dealId.toString());

      const response = await dealsApi.uploadDealImage(formData);
      const newImageUrl = response.data.url;
      
      setImageUrl(newImageUrl);
      onImageUploaded(newImageUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!dealId || !imageUrl) return;

    try {
      await dealsApi.deleteDealImage(dealId);
      setImageUrl(undefined);
      setSelectedFile(null);
      onImageDeleted();
      
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
        onClick={handleImageClick}
      >
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Deal"
              className="w-full h-48 object-contain rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick();
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48">
            <ImagePlus className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Click to upload an image
            </p>
            <p className="text-xs text-gray-400">
              Recommended size: 800x600px, JPG or PNG format
            </p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}; 