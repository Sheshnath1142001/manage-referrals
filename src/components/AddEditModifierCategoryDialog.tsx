
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
    setFormData({
      id: "",
      name: "",
      seqNo: 0,
      max: null,
      status: "Active",
      isMandatory: false,
      isSingleSelect: false
    });
  };

  const isViewMode = mode === "VIEW";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "EDIT" ? "Edit" : mode === "VIEW" ? "View" : "Add"} Modifier Category
          </DialogTitle>
        </DialogHeader>

        <form id="modifier-category-form" onSubmit={handleSubmit} className="pt-6 space-y-6">
          {/* INPUTS ROW: Name and Maximum side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-sm font-medium">
                Category Name*
              </Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  name: e.target.value
                })}
                placeholder="Enter category name"
                required
                maxLength={255}
                autoFocus
                disabled={isSubmitting || isViewMode}
                className="h-10"
              />
            </div>
            
            {/* Maximum field - only show if not single select */}
            {!formData.isSingleSelect && (
              <div className="space-y-2">
                <Label htmlFor="maximum" className="text-sm font-medium">
                  Maximum*
                </Label>
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
                  placeholder="Enter maximum value"
                  disabled={isSubmitting || isViewMode}
                  required={!formData.isSingleSelect}
                  className="h-10"
                />
              </div>
            )}
          </div>

          {/* SWITCHES ROW: Status, Mandatory, and Single Select with equal spacing */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status Switch */}
            <div className="flex items-center justify-center space-x-3">
              <Label htmlFor="status" className="text-sm font-medium">
                Active
              </Label>
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
            </div>
            
            {/* Mandatory Switch */}
            <div className="flex items-center justify-center space-x-3">
              <Label htmlFor="isMandatory" className="text-sm font-medium">
                Mandatory
              </Label>
              <Switch
                id="isMandatory"
                checked={formData.isMandatory}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isMandatory: checked })
                }
                disabled={isSubmitting || isViewMode}
              />
            </div>
            
            {/* Single Select Switch */}
            <div className="flex items-center justify-center space-x-3">
              <Label htmlFor="isSingleSelect" className="text-sm font-medium">
                Single Select
              </Label>
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
            </div>
          </div>

          {/* BUTTONS ROW */}
          {isViewMode ? (
            <div className="flex justify-end pt-8">
              <Button 
                onClick={() => onOpenChange(false)}
                className="min-w-[100px]"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-4 pt-8">
              <Button 
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "EDIT" ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  mode === "EDIT" ? "Update" : "Create"
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditModifierCategoryDialog;
