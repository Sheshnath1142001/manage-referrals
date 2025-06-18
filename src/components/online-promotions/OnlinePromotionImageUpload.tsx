import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { attachmentsApi } from "@/services/api/attachments";
import { useQueryClient } from "@tanstack/react-query";

interface OnlinePromotionImageUploadProps {
  promotionId?: number;
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted: () => void;
  /**
   * Callback that returns the actual selected file so that parent component
   * can upload it to server after the banner is created. Pass `null` when
   * the image is removed.
   */
  onFileSelected?: (file: File | null) => void;
  disabled?: boolean;
  // Backend attachment info for existing images
  moduleType?: string | number; // default '5' (banners)
  moduleId?: string | number;
  attachmentId?: string | number;
}

export const OnlinePromotionImageUpload = ({
  promotionId,
  initialImageUrl,
  onImageUploaded,
  onImageDeleted,
  onFileSelected,
  disabled = false,
  moduleType = '5',
  moduleId,
  attachmentId,
}: OnlinePromotionImageUploadProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAttachmentId, setCurrentAttachmentId] = useState<string | number | undefined>(attachmentId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
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
    onImageUploaded(previewUrl);
    onFileSelected?.(file);
    // Selecting new file means attachment will change after form submit
    setCurrentAttachmentId(undefined);
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;

    const targetModuleId = moduleId ?? promotionId;

    try {
      if (targetModuleId) {
        await attachmentsApi.deleteAttachments({
          attachment_ids: currentAttachmentId ? [currentAttachmentId] : [],
          module_type: moduleType,
          module_id: targetModuleId,
        });
      }

      setImageUrl(undefined);
      setSelectedFile(null);
      setCurrentAttachmentId(undefined);
      onImageDeleted();
      onFileSelected?.(null);

      // Refresh promotions list so UI reflects removal
      queryClient.invalidateQueries({ queryKey: ["onlinePromotions"] });

      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed border-gray-300 rounded-lg p-4 ${!disabled ? 'cursor-pointer hover:border-primary' : ''} transition-colors`}
        onClick={handleImageClick}
      >
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Promotion"
              className="w-full h-32 object-contain rounded-lg"
            />
            {!disabled && (
              <div className="absolute top-2 right-2">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-xs text-gray-500">
              {disabled ? "No image uploaded" : "Click to upload an image"}
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">
        Max: 5MB | Aspect Ratio: 9:16
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
};
