import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { attachmentsApi } from "@/services/api/attachments";

interface DealImageUploadProps {
  dealId?: number;
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string | File) => void;
  onImageDeleted: () => void;
  moduleType?: string | number;
  moduleId?: string | number;
  attachmentId?: string | number;
}

export const DealImageUpload = ({
  dealId,
  initialImageUrl,
  onImageUploaded,
  onImageDeleted,
  moduleType = '9',
  moduleId,
  attachmentId,
}: DealImageUploadProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // kept for potential use in upload flow
  const [currentAttachmentId, setCurrentAttachmentId] = useState<string | number | undefined>(attachmentId);

  // Synchronize imageUrl when parent provides a new initialImageUrl (e.g., editing existing deal)
  useEffect(() => {
    if (selectedFile) return; // do not overwrite preview while uploading

    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    } else {
      // Clear image when switching to create mode
      setImageUrl(undefined);
    }
  }, [initialImageUrl, selectedFile]);

  // Keep local attachment id in sync with prop
  useEffect(() => {
    setCurrentAttachmentId(attachmentId);
  }, [attachmentId]);

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

    // Create a temporary URL for preview and inform parent immediately
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
    setSelectedFile(file);
    // When a user selects a new local file, we no longer have an attachment id from backend
    setCurrentAttachmentId(undefined);

    // Notify parent with raw File so it can be uploaded after form submit
    onImageUploaded(file);
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;

    const targetModuleId = moduleId ?? dealId;

    if (!targetModuleId) return;

    try {
      // Prefer bulk delete endpoint to satisfy requirement of hitting only /attachments DELETE
      await attachmentsApi.deleteAttachments({
        attachment_ids: currentAttachmentId ? [currentAttachmentId] : [],
        module_type: moduleType,
        module_id: targetModuleId,
      });
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      />
    </div>
  );
}; 