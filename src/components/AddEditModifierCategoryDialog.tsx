import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ModifierCategory } from "@/types/modifiers";
import { useNavigate } from "react-router-dom";

interface AddEditModifierCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (category: ModifierCategory) => void;
  initialData?: ModifierCategory;
  isSubmitting?: boolean;
  mode?: "ADD" | "EDIT" | "VIEW";
}

const AddEditModifierCategoryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting = false,
  mode = "ADD"
}: AddEditModifierCategoryDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ModifierCategory>({
    id: "",
    name: "",
    seqNo: 0,
    max: null,
    status: "Active",
    isMandatory: false,
    isSingleSelect: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData({
        id: "",
        name: "",
        seqNo: 0,
        max: null,
        status: "Active",
        isMandatory: false,
        isSingleSelect: false
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have a valid auth token
    const adminData = localStorage.getItem('Admin');
    const token = adminData ? JSON.parse(adminData).token : localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to save changes.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    // If it's a single select category, max should be 1
    const submitData: ModifierCategory = {
      ...formData
    };
    
    if (submitData.isSingleSelect) {
      submitData.max = 1;
    }
    
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      
      if ((error as any)?.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      toast({
        title: "Error",
        description: (error as any)?.message || "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData({
        id: "",
        name: "",
        seqNo: 0,
        max: null,
        status: "Active",
        isMandatory: false,
        isSingleSelect: false
      });
    }
  };

  const isViewMode = mode === "VIEW";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden flex flex-col max-h-[90vh] my-4">
        <DialogHeader className="bg-primary text-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {mode === "EDIT" ? "Edit" : mode === "VIEW" ? "View" : "Add"} Modifier Category
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          <form id="modifier-category-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {initialData && initialData.id && (
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-sm font-medium text-gray-700">ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    readOnly
                    disabled
                    className="h-10 bg-gray-100 border border-gray-300"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Category Name<span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: e.target.value
                  })}
                  required
                  disabled={isSubmitting || isViewMode}
                  className="h-10 bg-white border border-gray-300"
                />
              </div>
              
              {isViewMode && (
                <div className="space-y-2">
                  <Label htmlFor="seqNo" className="text-sm font-medium text-gray-700">Sequence No</Label>
                  <Input
                    id="seqNo"
                    value={formData.seqNo?.toString()}
                    readOnly
                    className="h-10 bg-gray-100 border border-gray-300"
                    disabled
                  />
                </div>
              )}
              
              {!formData.isSingleSelect && (
                <div className="space-y-2">
                  <Label htmlFor="maximum" className="text-sm font-medium text-gray-700">Maximum<span className="text-red-500">*</span></Label>
                  <Input
                    id="maximum"
                    type="number"
                    value={formData.max?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max: e.target.value ? parseInt(e.target.value) : null
                      })
                    }
                    className="h-10 bg-white border border-gray-300"
                    placeholder="Enter maximum value"
                    disabled={isSubmitting || isViewMode}
                    required={!formData.isSingleSelect}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="status"
                    checked={formData.status === "Active"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "Active" : "Inactive"
                      })
                    }
                    disabled={isSubmitting || isViewMode}
                  />
                  <span className="text-sm">{formData.status === "Active" ? 'Active (1)' : 'Inactive (0)'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isMandatory" className="text-sm font-medium text-gray-700">Mandatory</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isMandatory"
                    checked={formData.isMandatory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isMandatory: checked })
                    }
                    disabled={isSubmitting || isViewMode}
                  />
                  <span className="text-sm">{formData.isMandatory ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isSingleSelect" className="text-sm font-medium text-gray-700">Single Select</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isSingleSelect"
                    checked={formData.isSingleSelect}
                    onCheckedChange={(checked) =>
                      setFormData({ 
                        ...formData, 
                        isSingleSelect: checked,
                        // Set max to 1 if single select is enabled
                        max: checked ? 1 : formData.max
                      })
                    }
                    disabled={isSubmitting || isViewMode}
                  />
                  <span className="text-sm">{formData.isSingleSelect ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="border-t px-6 py-4 bg-gray-50 sticky bottom-0">
          {isViewMode ? (
            <Button 
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
              Close
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="h-10"
              >
                Reset
              </Button>
            <Button 
              form="modifier-category-form"
              type="submit" 
              disabled={isSubmitting}
                className="h-10 bg-[#6E41E2] hover:bg-[#5835B0] text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "EDIT" ? "Update" : "Create"}
            </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditModifierCategoryDialog;
