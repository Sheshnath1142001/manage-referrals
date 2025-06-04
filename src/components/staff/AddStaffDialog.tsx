
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { staffApi } from "@/services/api/staff";
import { StaffForm } from "./StaffForm";

interface AddStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStaffDialog({ isOpen, onClose, onSuccess }: AddStaffDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    email: "",
    phoneNo: "",
    username: "",
    password: "",
    active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await staffApi.createStaffMember({
        name: formData.name,
        type: formData.type,
        location: formData.location,
        email: formData.email,
        phone: formData.phoneNo,
        username: formData.username,
        password: formData.password,
        status: formData.active ? 'Active' : 'Inactive'
      });
      
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
      
      handleReset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add staff member:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      type: "",
      location: "",
      email: "",
      phoneNo: "",
      username: "",
      password: "",
      active: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Staff Member</DialogTitle>
        </DialogHeader>
        
        <StaffForm
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          handleReset={handleReset}
          mode="add"
        />
      </DialogContent>
    </Dialog>
  );
}
