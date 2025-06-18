
import { useState } from "react";
import { X } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { staffApi } from "@/services/api/staff";
import { StaffForm } from "./StaffForm";

interface AddStaffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddStaffSheet({ open, onOpenChange, onSuccess }: AddStaffSheetProps) {
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
      onOpenChange(false);
    } catch (error) {
      
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[525px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold bg-purple-700 text-white py-3 px-4 -mx-6 -mt-6 flex justify-between items-center">
            <span>Add User</span>
            <SheetClose className="rounded-sm opacity-70 hover:opacity-100">
              <X className="h-5 w-5 text-white" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        
        <StaffForm
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          handleReset={handleReset}
          mode="add"
        />
      </SheetContent>
    </Sheet>
  );
}
