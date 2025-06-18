import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Category } from "./CategoriesContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from 'axios';

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: Category | null;
  isViewMode: boolean;
  createMutation: any;
  updateMutation: any;
  onClose: () => void;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export function CategorySheet({
  open,
  onOpenChange,
  editingCategory,
  isViewMode,
  createMutation,
  updateMutation,
  onClose,
}: CategorySheetProps) {
  const [formData, setFormData] = useState({
    id: '',
    category: '',
    status: '1',
    image: null as File | null,
    imagePreview: '' as string,
    hasImageChanged: false, // Track if image was changed during edit
    existingAttachmentId: null as number | string | null, // Store existing attachment ID
    imageDeleted: false // Track if existing image was deleted
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingAttachment, setIsUpdatingAttachment] = useState(false);
  const isLoading = createMutation.isPending || updateMutation.isPending || isDeleting || isUpdatingAttachment;

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        category: editingCategory.name,
        status: editingCategory.status === 'active' ? '1' : '0',
        image: null,
        imagePreview: '',
        hasImageChanged: false,
        existingAttachmentId: editingCategory.id,
        imageDeleted: false
      });
      
      // Fetch image from attachments API
      axios.get(`${apiBaseUrl}/attachments?module_type=1&module_id=${editingCategory.id}`)
        .then(res => {
          const attachments = res.data.attachment || [];
          if (attachments.length > 0) {
            setFormData(prev => ({
              ...prev,
              imagePreview: attachments[0].upload_path,
              existingAttachmentId: attachments[0].id
            }));
          } else {
            // No existing attachment found
            setFormData(prev => ({
              ...prev,
              existingAttachmentId: null
            }));
          }
        })
        .catch(error => {
          
          // Set existingAttachmentId to null if API fails
          setFormData(prev => ({
            ...prev,
            existingAttachmentId: null
          }));
        });
    } else {
      setFormData({
        id: '',
        category: '',
        status: '1',
        image: null,
        imagePreview: '',
        hasImageChanged: false,
        existingAttachmentId: null,
        imageDeleted: false
      });
    }
  }, [editingCategory, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewMode) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (checked: boolean) => {
    if (isViewMode) return;
    
    setFormData(prev => ({
      ...prev,
      status: checked ? '1' : '0'
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewMode) return;
    
    const file = e.target.files?.[0];
    if (file) {
      
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        hasImageChanged: true, // Mark that image was changed
        imageDeleted: false // Reset deleted flag when new image is selected
      }));
    }
  };

  // Function to delete attachment using the PATCH API
  const deleteAttachment = async (attachmentId: number, categoryId: string) => {
    try {
      setIsDeleting(true);
      
      
      const token = JSON.parse(localStorage.getItem('Admin') || '{}').token;
      
      const response = await axios.patch(
        `${apiBaseUrl}/attachment/status/${attachmentId}/1/${categoryId}`,
        {}, // Empty body for delete
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta',
          }
        }
      );
      
      
      return response.data;
    } catch (error) {
      
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete image confirmation
  const handleDeleteImage = async () => {
    if (!formData.existingAttachmentId) return;
    
    try {
      await deleteAttachment(formData.existingAttachmentId, formData.id);
      
      // Update form state to reflect deletion
      setFormData(prev => ({
        ...prev,
        imagePreview: '',
        existingAttachmentId: null,
        image: null,
        hasImageChanged: false,
        imageDeleted: true
      }));
      
      toast({
        title: "Image Deleted",
        description: "Category image deleted successfully",
      });
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete category image",
        variant: "destructive"
      });
    }
  };

  // Function to create new attachment using POST API
  const createAttachment = async (categoryId: string, newFile: File) => {
    try {
      setIsUpdatingAttachment(true);
      const formData = new FormData();
      formData.append('module_type', '1');
      formData.append('module_id', categoryId);
      formData.append('attachment', newFile);
      formData.append('attachment_type', '1');
      
      
      console.log('File details:', {
        name: newFile.name,
        size: newFile.size,
        type: newFile.type
      });
      
      const token = JSON.parse(localStorage.getItem('Admin') || '{}').token;
      
      // POST request to create new attachment
      const response = await axios.post(
        `${apiBaseUrl}/attachment`,
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta',
            // Don't set Content-Type - let axios handle multipart/form-data automatically
          }
        }
      );
      
      
      return response.data;
    } catch (error) {
      
      if (axios.isAxiosError(error)) {
        
        
      }
      throw error;
    } finally {
      setIsUpdatingAttachment(false);
    }
  };

  // Function to update attachment using the PATCH API
  const updateAttachment = async (attachmentId: number, categoryId: string, newFile: File) => {
    try {
      setIsUpdatingAttachment(true);
      const formData = new FormData();
      formData.append('attachment', newFile);
      
      
      console.log('File details:', {
        name: newFile.name,
        size: newFile.size,
        type: newFile.type
      });
      
      const token = JSON.parse(localStorage.getItem('Admin') || '{}').token;
      
      // This is the exact API call for updating existing attachment: PATCH /attachment/{attachmentId}/1/{categoryId}
      const response = await axios.patch(
        `${apiBaseUrl}/attachment/${attachmentId}/1/${categoryId}`,
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta',
            // Don't set Content-Type - let axios handle multipart/form-data automatically
          }
        }
      );
      
      
      return response.data;
    } catch (error) {
      
      if (axios.isAxiosError(error)) {
        
        
      }
      throw error;
    } finally {
      setIsUpdatingAttachment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (isViewMode) {
      onOpenChange(false);
      return;
    }
    
    if (!formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (editingCategory) {
      // For update operation
      
      
      
      
      
      // Handle image operations if image was changed
      if (formData.hasImageChanged && formData.image) {
        try {
          if (formData.existingAttachmentId) {
            // Case 1: Category has existing image - UPDATE via PATCH API
            
            await updateAttachment(formData.existingAttachmentId, formData.id, formData.image);
            
            toast({
              title: "Image Updated",
              description: "Category image updated successfully",
            });
            
          } else {
            // Case 2: Category doesn't have image - CREATE via POST API
            
            const result = await createAttachment(formData.id, formData.image);
            
            // Update form state with new attachment ID
            setFormData(prev => ({
              ...prev,
              existingAttachmentId: result.attachment?.id || null
            }));
            
            toast({
              title: "Image Added",
              description: "Category image added successfully",
            });
            
          }
        } catch (error) {
          
          toast({
            title: "Error",
            description: "Failed to update category image",
            variant: "destructive"
          });
          return; // Don't proceed with category update if image operation failed
        }
      }
      
      // Now update the category details (without image data since it's handled separately)
      const categoryData = {
        id: formData.id,
        category: formData.category.trim(),
        status: formData.status
      };
      
      
      updateMutation.mutate(categoryData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Category updated successfully",
          });
          onOpenChange(false);
          onClose();
        },
        onError: (error: any) => {
          
          toast({
            title: "Error",
            description: error?.message || "Failed to update category",
            variant: "destructive"
          });
        }
      });
    } else {
      // For create operation - include image if provided
      const data = new FormData();
      data.append('category', formData.category.trim());
      data.append('status', formData.status);
      data.append('module_type', '1');
      
      if (formData.image) {
        
        data.append('attachment', formData.image);
      } else {
        
      }
      
      
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          
        } else {
          
        }
      }
      
      createMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Category created successfully",
          });
          onOpenChange(false);
          onClose();
        },
        onError: (error: any) => {
          
          toast({
            title: "Error",
            description: error?.message || "Failed to create category",
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onClose();
    }}>
      <SheetContent className="sm:max-w-[500px] p-0 overflow-y-auto flex flex-col h-screen">
        <SheetHeader className="bg-primary text-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-white">
              {isViewMode 
                ? "View Category" 
                : editingCategory 
                  ? "Edit Category" 
                  : "Add Category"}
            </SheetTitle>
            <Button variant="ghost" className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 px-6 py-4">
          <form id="category-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {editingCategory && (
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-sm font-medium text-gray-700">ID</Label>
                  <Input
                    id="id"
                    name="id"
                    value={formData.id}
                    readOnly
                    disabled
                    className="h-10 bg-gray-100 border border-gray-300 w-full"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category Name<span className="text-red-500">*</span></Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  required
                  className="h-10 bg-white border border-gray-300 w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="status"
                    checked={formData.status === '1'}
                    onCheckedChange={handleStatusChange}
                    disabled={isViewMode}
                  />
                  <span className="text-sm">{formData.status === '1' ? 'Active (1)' : 'Inactive (0)'}</span>
                </div>
              </div>

              <div className="space-y-2">
                {formData.imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={formData.imagePreview} 
                      alt={formData.category} 
                      className="w-full h-full object-contain"
                    />
                    {!isViewMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <label 
                            htmlFor="image-upload" 
                            className="cursor-pointer flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                          >
                            <Upload className="h-4 w-4" />
                            {isUpdatingAttachment ? 'Updating...' : 'Change Image'}
                          </label>
                          
                          {/* Delete button with confirmation dialog */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category Image</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this image? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteImage}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Image
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !isViewMode && (
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <Upload className="h-8 w-8" />
                      <span>Click to upload image</span>
                    </div>
                  </label>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isViewMode || isUpdatingAttachment}
                />
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="border-t px-6 py-4 bg-gray-50 sticky bottom-0">
          <Button 
            form="category-form"
            type="submit" 
            disabled={isLoading}
            className="h-10"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isViewMode 
              ? "Close" 
              : editingCategory 
                ? (isUpdatingAttachment ? "Updating Image..." : "Update Category")
                : "Create Category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}