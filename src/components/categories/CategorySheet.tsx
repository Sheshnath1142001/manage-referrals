import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Category } from "./CategoriesContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
    imagePreview: '' as string
  });
  
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        category: editingCategory.name,
        status: editingCategory.status === 'active' ? '1' : '0',
        image: null,
        imagePreview: ''
      });
      // Fetch image from attachments API
      axios.get(`https://pratham-respos-testbe-v34.achyutlabs.cloud/api/attachments?module_type=1&module_id=${editingCategory.id}`)
        .then(res => {
          const attachments = res.data.attachment || [];
          if (attachments.length > 0) {
            setFormData(prev => ({
              ...prev,
              imagePreview: attachments[0].upload_path
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching image:', error);
        });
    } else {
      setFormData({
        id: '',
        category: '',
        status: '1',
        image: null,
        imagePreview: ''
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
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      const data = new FormData();
      data.append('id', formData.id);
      data.append('category', formData.category);
      data.append('status', formData.status);
      
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      updateMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          onClose();
        }
      });
    } else {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('status', formData.status);
      data.append('module_type', '1');
      
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          onClose();
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
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">Category Image</Label>
                {formData.imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={formData.imagePreview} 
                      alt={formData.category} 
                      className="w-full h-full object-contain"
                    />
                    {!isViewMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <label 
                          htmlFor="image-upload" 
                          className="cursor-pointer flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          Change Image
                        </label>
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
                  disabled={isViewMode}
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
                ? "Update Category" 
                : "Create Category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
