import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import axios from 'axios';
import { api } from '@/services/api/client';

interface ItemImageUploadProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  editingItem?: any;
}

export const ItemImageUpload = ({
  formData,
  updateFormField,
  isViewMode,
  editingItem
}: ItemImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (formData.imagePreview) {
      loadImage();
    } else {
      setImageUrl(null);
    }
  }, [formData.imagePreview, formData.imageToken]);

  const loadImage = async () => {
    try {
      // Check if it's an external URL (like istockphoto.com) or a data URL
      if (formData.imagePreview.startsWith('data:') || 
          formData.imagePreview.startsWith('http://') || 
          formData.imagePreview.startsWith('https://')) {
        // For external URLs or data URLs, use directly
        setImageUrl(formData.imagePreview);
        setImageError(false);
        return;
      }

      // For protected URLs, use token authentication
      if (formData.imageToken) {
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
      } else {
        // Fallback: try to use the URL directly
        setImageUrl(formData.imagePreview);
        setImageError(false);
      }
    } catch (error) {
      
      // Fallback: try to use the URL directly
      try {
        setImageUrl(formData.imagePreview);
        setImageError(false);
      } catch (fallbackError) {
        
        setImageError(true);
      }
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

  const handleDeleteImage = async () => {
    if (!editingItem?.id) return;
    
    setIsDeleting(true);
    try {
      // Get the auth token
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      // First get the attachment details to get the attachment ID
      const attachmentsResponse = await axios.get(
        `${import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api'}/attachments`,
        {
          params: {
            module_type: 2,
            module_id: editingItem.id
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta'
          }
        }
      );

      const attachments = attachmentsResponse.data.attachment || [];
      if (attachments.length > 0) {
        const attachmentId = attachments[0].id;
        
        // Delete the attachment using PATCH request
        const response = await axios.patch(
          `${import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api'}/attachment/status/${attachmentId}/2/${editingItem.id}`,
          {}, // Empty body for delete
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'X-Timezone': 'Asia/Calcutta',
            }
          }
        );
        
        
        
        // Clear the image preview
        updateFormField("imagePreview", "");
        updateFormField("image", null);
        setImageUrl(null);
        setImageError(false);
        setShowDeleteDialog(false);
        
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="space-y-2 h-full">
      <Label htmlFor="image">Item Image</Label>
      <div 
        className={`border-2 border-dashed rounded-lg p-4 h-[152px] flex flex-col items-center justify-center relative
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
            {/* Show delete icon only in edit mode */}
            {!isViewMode && editingItem && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this image? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteImage}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
