import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { staffApi } from "@/services/api/staff";
import { StaffForm } from "./StaffForm";

interface StaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialData?: any;
}

export function StaffDialog({ isOpen, onClose, onSuccess, mode, initialData }: StaffDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    roleId: 0,
    location: "",
    locationId: 0,
    email: "",
    phoneNo: "",
    username: "",
    password: "",
    active: true
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      
      const roleId = initialData.role_id || initialData.roles?.id || 0;
      
      
      setFormData({
        name: initialData.name || "",
        type: initialData.roles?.role || "",
        roleId: roleId,
        location: initialData.restaurants_users_employee_outlet_idTorestaurants?.name || "",
        locationId: initialData.employee_outlet_id || initialData.restaurants_users_employee_outlet_idTorestaurants?.id || 0,
        email: initialData.email || "",
        phoneNo: initialData.phone_no || "",
        username: initialData.username || "",
        password: "", // Password is empty in edit mode
        active: initialData.status === 1
      });
    } else {
      setFormData({
        name: "",
        type: "",
        roleId: 0,
        location: "",
        locationId: 0,
        email: "",
        phoneNo: "",
        username: "",
        password: "",
        active: true
      });
    }
  }, [mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const apiCall = mode === "add" 
        ? () => staffApi.createStaffMember({
            email: formData.email,
            name: formData.name,
            password: formData.password || null,
            phone_no: formData.phoneNo,
            restaurant_id: formData.locationId,
            role_id: formData.roleId,
            status: formData.active ? 1 : 0
          })
        : () => staffApi.updateStaffMember(initialData.id, {
            name: formData.name,
            email: formData.email,
            phone_no: formData.phoneNo,
            status: formData.active ? 1 : 0,
            role_id: formData.roleId,
            restaurant_id: formData.locationId,
            ...(formData.password && { password: formData.password })
          });

      await apiCall();
      
      toast({
        title: "Success",
        description: `Staff member ${mode === "add" ? "added" : "updated"} successfully`,
      });
      
      handleReset();
      onSuccess();
      onClose();
    } catch (error) {
      
      toast({
        title: "Error",
        description: `Failed to ${mode} staff member. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (mode === "edit" && initialData) {
      const roleId = initialData.role_id || initialData.roles?.id || 0;
      
      setFormData({
        name: initialData.name || "",
        type: initialData.roles?.role || "",
        roleId: roleId,
        location: initialData.restaurants_users_employee_outlet_idTorestaurants?.name || "",
        locationId: initialData.employee_outlet_id || initialData.restaurants_users_employee_outlet_idTorestaurants?.id || 0,
        email: initialData.email || "",
        phoneNo: initialData.phone_no || "",
        username: initialData.username || "",
        password: "", // Password is empty in edit mode
        active: initialData.status === 1
      });
    } else {
      setFormData({
        name: "",
        type: "",
        roleId: 0,
        location: "",
        locationId: 0,
        email: "",
        phoneNo: "",
        username: "",
        password: "",
        active: true
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Add Staff Member" : "Edit Staff Member"}
          </DialogTitle>
        </DialogHeader>
        
        <StaffForm
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          handleReset={handleReset}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}
