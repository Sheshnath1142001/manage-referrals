import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Category } from "./CategoriesContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface CategoryFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingCategory: Category | null;
  isViewMode: boolean;
  createMutation: any;
  updateMutation: any;
  onClose: () => void;
}

export function CategoryForm({
  isOpen,
  setIsOpen,
  editingCategory,
  isViewMode,
  createMutation,
  updateMutation,
  onClose,
}: CategoryFormProps) {
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
        imagePreview: editingCategory.image || ''
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
  }, [editingCategory, isOpen]);

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
    if (isViewMode || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewMode) {
      setIsOpen(false);
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
    
    const data = new FormData();
    
    if (editingCategory) {
      data.append('id', formData.id);
    }
    
    data.append('category', formData.category);
    data.append('status', formData.status);
    
    if (!editingCategory) {
      data.append('module_type', '1');
    }
    
    if (formData.image) {
      data.append('image', formData.image);
    }
    
    if (editingCategory) {
      updateMutation.mutate(data, {
        onSuccess: () => {
          setIsOpen(false);
          onClose();
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsOpen(false);
          onClose();
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden flex flex-col max-h-[90vh] my-4">
        <DialogHeader className="bg-primary text-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {isViewMode 
                ? "View Category" 
                : editingCategory 
                  ? "Edit Category" 
                  : "Add Category"}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <form id="category-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {editingCategory && (
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-sm font-medium text-gray-700">ID</Label>
                  <Input
                    id="id"
                    name="id"
                    value={formData.id}
                    readOnly
                    disabled
                    className="h-10 bg-gray-100 border border-gray-300"
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
                  className="h-10 bg-white border border-gray-300"
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
              
              <div className="space-y-2 col-span-3">
                <Label className="text-sm font-medium text-gray-700">Category Image</Label>
                
                <div 
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    if (!isViewMode) {
                      document.getElementById('image-upload')?.click();
                    }
                  }}
                >
                  {formData.imagePreview ? (
                    <div className="flex justify-center">
                      <img
                        src={formData.imagePreview}
                        alt="Category preview"
                        className="max-h-40 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload className="h-10 w-10 mb-2 text-gray-400" />
                      <p className="text-sm">Click to upload or drag and drop</p>
                    </div>
                  )}
                </div>
                
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isViewMode}
                  className="hidden"
                />
              </div>
            </div>
          </form>
        </div>
        
        <DialogFooter className="border-t px-6 py-4 bg-gray-50 sticky bottom-0">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
