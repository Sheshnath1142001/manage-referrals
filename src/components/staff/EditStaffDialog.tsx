
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staffApi, StaffMember } from "@/services/api/staff";
import { StaffForm } from "./StaffForm";

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  staffId: string | null;
}

export function EditStaffDialog({ open, onOpenChange, onSuccess, staffId }: EditStaffDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState<StaffMember | null>(null);
  
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

  useEffect(() => {
    if (open && staffId) {
      setIsLoading(true);
      staffApi.getStaffMember(staffId)
        .then((staffMemberData) => {
          setStaffData(staffMemberData);
          setFormData({
            name: staffMemberData.name,
            type: staffMemberData.type || '',
            location: staffMemberData.location || '',
            email: staffMemberData.email,
            phoneNo: staffMemberData.phone || '',
            username: staffMemberData.username || '',
            password: "",
            active: staffMemberData.status === "Active"
          });
        })
        .catch((error) => {
          console.error("Failed to fetch staff data:", error);
          toast({
            title: "Error",
            description: "Failed to load staff data. Please try again.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, staffId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData: Partial<StaffMember> = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        email: formData.email,
        phone: formData.phoneNo,
        username: formData.username,
        status: formData.active ? 'Active' : 'Inactive'
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      await staffApi.updateStaffMember(staffId, updateData);
      
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update staff member:", error);
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (staffData) {
      setFormData({
        name: staffData.name,
        type: staffData.type || '',
        location: staffData.location || '',
        email: staffData.email,
        phoneNo: staffData.phone || '',
        username: staffData.username || '',
        password: "",
        active: staffData.status === "Active"
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-8">
            <p>Loading staff data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <StaffForm
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          handleReset={handleReset}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
}
