import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Trash, Loader2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { attachmentsApi } from "@/services/api/attachments";

interface Location {
  id: number;
  name: string;
  locationType: string;
  type: string;
  owner: string;
  status: "Active" | "Inactive";
  receiverEmail: string;
  serviceType: string | string[];
  phone: string;
  // Additional fields based on the image
  unitNumber?: string;
  streetName?: string;
  postcode?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  alternatePhone?: string;
  email?: string;
  image?: string;
}

interface AddEditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (location: Location) => void;
  initialData?: Location;
  viewOnly?: boolean;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const AddEditLocationDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  viewOnly = false,
}: AddEditLocationDialogProps) => {
  const [formData, setFormData] = useState<Omit<Location, "id">>({
    name: "",
    locationType: "OUTLET",
    type: "",
    owner: "",
    status: "Active",
    receiverEmail: "",
    serviceType: [],
    phone: "",
    unitNumber: "",
    streetName: "",
    postcode: "",
    city: "",
    province: "",
    country: "Australia",
    latitude: "",
    longitude: "",
    alternatePhone: "",
    email: "",
    image: "",
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Add new state for timing details
  const [timingDetails, setTimingDetails] = useState<any[]>([]);
  const [isLoadingTiming, setIsLoadingTiming] = useState(false);
  
  // Available service types
  const serviceTypes = [
    { id: "1", name: "Dine In" },
    { id: "2", name: "Takeaway" },
    { id: "3", name: "Delivery" }
  ];
  
  const [hasExistingImage, setHasExistingImage] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      // Parse service types from initialData
      let parsedServiceTypes: string[] = [];
      
      if (typeof initialData.serviceType === 'string') {
        // If it's a comma-separated string, split it
        parsedServiceTypes = initialData.serviceType.split(', ').map(s => s.trim());
      } else if (Array.isArray(initialData.serviceType)) {
        // If it's already an array, use it
        parsedServiceTypes = initialData.serviceType;
      }
      
      setFormData({
        name: initialData.name || "",
        locationType: initialData.locationType || "OUTLET",
        type: initialData.type || "",
        owner: initialData.owner || "",
        status: initialData.status || "Active",
        receiverEmail: initialData.receiverEmail || "",
        serviceType: parsedServiceTypes,
        phone: initialData.phone || "",
        unitNumber: initialData.unitNumber || "",
        streetName: initialData.streetName || "",
        postcode: initialData.postcode || "",
        city: initialData.city || "",
        province: initialData.province || "",
        country: initialData.country || "Australia",
        latitude: initialData.latitude || "",
        longitude: initialData.longitude || "",
        alternatePhone: initialData.alternatePhone || "",
        email: initialData.receiverEmail || "",
        image: initialData.image || "",
      });
      
      setImagePreview(initialData.image || null);
      setHasExistingImage(!!initialData.image);
    } else {
      setFormData({
        name: "",
        locationType: "OUTLET",
        type: "",
        owner: "",
        status: "Active",
        receiverEmail: "",
        serviceType: [],
        phone: "",
        unitNumber: "",
        streetName: "",
        postcode: "",
        city: "",
        province: "",
        country: "Australia",
        latitude: "",
        longitude: "",
        alternatePhone: "",
        email: "",
        image: "",
      });
      
      setImagePreview(null);
      setHasExistingImage(false);
    }
  }, [initialData, open]);
  
  // Update the useEffect hook for fetching data
  useEffect(() => {
    if (open && initialData?.id) {
      // Fetch address and image data
      const fetchData = async () => {
        setIsLoadingImage(true);
        setAddressLoading(true);
        try {
          // Get token from localStorage
          const adminData = localStorage.getItem('Admin');
          let token = '';
          if (adminData) {
            try {
              token = JSON.parse(adminData).token;
            } catch {}
          }

          // Fetch address details
          const addressResponse = await fetch(
            `${apiBaseUrl}/address?module_type=4&module_id=${initialData.id}`,
            {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );

          if (!addressResponse.ok) {
            throw new Error('Failed to fetch address details');
          }

          const addressData = await addressResponse.json();
          if (Array.isArray(addressData) && addressData.length > 0) {
            const addr = addressData[0];
            
            // Parse service types from initialData
            let parsedServiceTypes: string[] = [];
            
            if (typeof initialData.serviceType === 'string') {
              parsedServiceTypes = initialData.serviceType.split(', ').map(s => s.trim());
            } else if (Array.isArray(initialData.serviceType)) {
              parsedServiceTypes = initialData.serviceType;
            }
            
            setFormData(prev => ({
              ...prev,
              // Location details from initialData
              name: initialData.name || '',
              locationType: initialData.locationType || 'OUTLET',
              type: initialData.type || '',
              owner: initialData.owner || '',
              status: initialData.status || 'Active',
              receiverEmail: initialData.receiverEmail || '',
              serviceType: parsedServiceTypes,
              email: initialData.receiverEmail || '',
              // Address details
              unitNumber: addr.unit_number || '',
              streetName: addr.street_name || '',
              postcode: addr.postcode || '',
              city: addr.city || '',
              province: addr.province || '',
              country: addr.country || 'Australia',
              latitude: addr.latitude || '',
              longitude: addr.longitude || '',
              phone: addr.phone || '',
              alternatePhone: addr.alternate_phone || ''
            }));
          } else {
            // If no address data, still set the location details
            let parsedServiceTypes: string[] = [];
            
            if (typeof initialData.serviceType === 'string') {
              parsedServiceTypes = initialData.serviceType.split(', ').map(s => s.trim());
            } else if (Array.isArray(initialData.serviceType)) {
              parsedServiceTypes = initialData.serviceType;
            }
            
            setFormData(prev => ({
              ...prev,
              name: initialData.name || '',
              locationType: initialData.locationType || 'OUTLET',
              type: initialData.type || '',
              owner: initialData.owner || '',
              status: initialData.status || 'Active',
              receiverEmail: initialData.receiverEmail || '',
              serviceType: parsedServiceTypes,
              email: initialData.receiverEmail || ''
            }));
          }

          // Fetch image/attachment
          const imageResponse = await fetch(
            `${apiBaseUrl}/attachments?module_type=4&module_id=${initialData.id}`,
            {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );

          if (!imageResponse.ok) {
            throw new Error('Failed to fetch image');
          }

          const imageData = await imageResponse.json();
          if (imageData.attachment && imageData.attachment.length > 0) {
            const imageUrl = imageData.attachment[0].upload_path;
            setImagePreview(imageUrl);
            setFormData(prev => ({ ...prev, image: imageUrl }));
            setHasExistingImage(true);
          } else {
            setImagePreview(null);
            setFormData(prev => ({ ...prev, image: "" }));
            setHasExistingImage(false);
          }
        } catch (error) {
          
          toast({
            title: "Error",
            description: "Failed to fetch location data",
            variant: "destructive"
          });
        } finally {
          setIsLoadingImage(false);
          setAddressLoading(false);
        }
      };

      fetchData();
    } else {
      // Reset form for new location
      setFormData({
        name: "",
        locationType: "",
        type: "",
        owner: "",
        status: "Active",
        receiverEmail: "",
        serviceType: [],
        phone: "",
        unitNumber: "",
        streetName: "",
        postcode: "",
        city: "",
        province: "",
        country: "",
        latitude: "",
        longitude: "",
        alternatePhone: "",
        email: "",
        image: "",
      });
      setImagePreview(null);
      setSelectedFile(null);
      setHasExistingImage(false);
    }
  }, [open, initialData]);
  
  // Update useEffect to fetch timing details
  useEffect(() => {
    if (open && initialData?.id && viewOnly) {
      const fetchTimingDetails = async () => {
        setIsLoadingTiming(true);
        try {
          const adminData = localStorage.getItem('Admin');
          let token = '';
          if (adminData) {
            try {
              token = JSON.parse(adminData).token;
            } catch {}
          }

          const response = await fetch(
            `${apiBaseUrl}/restaurant-time-slots?restaurant_id=${initialData.id}`,
            {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch timing details');
          }

          const data = await response.json();
          setTimingDetails(data.restaurant_time_slots || []);
        } catch (error) {
          
          toast({
            title: "Error",
            description: "Failed to fetch timing details",
            variant: "destructive"
          });
        } finally {
          setIsLoadingTiming(false);
        }
      };

      fetchTimingDetails();
    }
  }, [open, initialData, viewOnly]);
  
  const handleChange = (field: keyof Omit<Location, "id">, value: string) => {
    if (viewOnly) return; // Prevent changes in view mode
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add new function to handle service type changes
  const handleServiceTypeChange = (serviceTypeName: string, checked: boolean) => {
    if (viewOnly) return;
    
    setFormData(prev => {
      const currentServiceTypes = Array.isArray(prev.serviceType) ? prev.serviceType : [];
      
      if (checked) {
        // Add service type if not already present
        if (!currentServiceTypes.includes(serviceTypeName)) {
          return {
            ...prev,
            serviceType: [...currentServiceTypes, serviceTypeName]
          };
        }
      } else {
        // Remove service type
        return {
          ...prev,
          serviceType: currentServiceTypes.filter(type => type !== serviceTypeName)
        };
      }
      
      return prev;
    });
  };
  
  const handleStatusChange = (checked: boolean) => {
    if (viewOnly) return; // Prevent changes in view mode
    
    setFormData(prev => ({
      ...prev,
      status: checked ? "Active" : "Inactive"
    }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (viewOnly) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Store the file and create a preview
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setHasExistingImage(false);
  };
  
  const handleRemoveImage = () => {
    if (viewOnly) return; // Prevent changes in view mode
    
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
    setHasExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const uploadImage = async (locationId: number) => {
    if (!selectedFile) return;

    try {
      // Get token from localStorage
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('module_type', '4');
      formData.append('module_id', locationId.toString());
      formData.append('attachment_type', '1');

      const response = await fetch(
        `${apiBaseUrl}/attachments`,
        {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (data.upload_path) {
        setFormData(prev => ({ ...prev, image: data.upload_path }));
      }
    } catch (error) {
      
      throw new Error('Failed to upload image');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formData.locationType = 'OUTLET';

    if (viewOnly) {
      onOpenChange(false);
      return;
    }
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.locationType) {
      toast({
        title: "Error",
        description: "Location type is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!Array.isArray(formData.serviceType) || formData.serviceType.length === 0) {
      toast({
        title: "Error",
        description: "At least one service type is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.receiverEmail && !formData.email) {
      toast({
        title: "Error",
        description: "Email for receiving orders is required",
        variant: "destructive"
      });
      return;
    }
    
    const locationData: Location & { selectedFile?: File } = {
      id: initialData?.id || 0,
      ...formData,
      serviceType: Array.isArray(formData.serviceType) ? formData.serviceType.join(", ") : formData.serviceType,
      receiverEmail: formData.receiverEmail || formData.email || "",
      selectedFile: selectedFile || undefined
    };
    console.log({ locationData })
    setIsSubmitting(true);
    try {
      await onSubmit(locationData);
      
      if (selectedFile && locationData.id) {
        await uploadImage(locationData.id);
      }
      
      onOpenChange(false);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    if (viewOnly) return; // Prevent changes in view mode
    
    if (initialData) {
      let parsedServiceTypes: string[] = [];
      
      if (typeof initialData.serviceType === 'string') {
        parsedServiceTypes = initialData.serviceType.split(', ').map(s => s.trim());
      } else if (Array.isArray(initialData.serviceType)) {
        parsedServiceTypes = initialData.serviceType;
      }
      
      setFormData({
        name: initialData.name,
        locationType: initialData.locationType,
        type: initialData.type,
        owner: initialData.owner,
        status: initialData.status,
        receiverEmail: initialData.receiverEmail,
        serviceType: parsedServiceTypes,
        phone: initialData.phone,
        unitNumber: initialData.unitNumber || "",
        streetName: initialData.streetName || "",
        postcode: initialData.postcode || "",
        city: initialData.city || "",
        province: initialData.province || "",
        country: initialData.country || "",
        latitude: initialData.latitude || "",
        longitude: initialData.longitude || "",
        alternatePhone: initialData.alternatePhone || "",
        email: initialData.email || "",
        image: initialData.image || "",
      });
      
      setImagePreview(initialData.image || null);
      setHasExistingImage(!!initialData.image);
    } else {
      setFormData({
        name: "",
        locationType: "",
        type: "",
        owner: "",
        status: "Active",
        receiverEmail: "",
        serviceType: [],
        phone: "",
        unitNumber: "",
        streetName: "",
        postcode: "",
        city: "",
        province: "",
        country: "",
        latitude: "",
        longitude: "",
        alternatePhone: "",
        email: "",
        image: "",
      });
      
      setImagePreview(null);
      setHasExistingImage(false);
    }
  };
  
  const fetchLocationImage = async (locationId: string | number) => {
    setIsLoadingImage(true);
    try {
      const response = await attachmentsApi.getAttachments({
        module_type: 4, // Restaurant module type
        module_id: locationId
      });
      
      if (response.attachment && response.attachment.length > 0) {
        setImagePreview(response.attachment[0].upload_path);
        setFormData(prev => ({ ...prev, image: response.attachment[0].upload_path }));
        setHasExistingImage(true);
      } else {
        setHasExistingImage(false);
      }
    } catch (error) {
      
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!initialData?.id) return;

    setIsLoadingImage(true);
    try {
      // Get token from localStorage
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      // First get the attachment details
      const response = await fetch(
        `${apiBaseUrl}/attachments?module_type=4&module_id=${initialData.id}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch image details');
      }

      const data = await response.json();
      if (data.attachment && data.attachment.length > 0) {
        const attachmentId = data.attachment[0].id;
        
        // Delete the attachment using PATCH request
        const deleteResponse = await fetch(
          `${apiBaseUrl}/attachment/status/${attachmentId}/4/${initialData.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete image');
        }

        const deleteData = await deleteResponse.json();
        if (deleteData.message) {
          setImagePreview(null);
          setFormData(prev => ({ ...prev, image: "" }));
          setHasExistingImage(false);
          toast({
            title: "Success",
            description: deleteData.message
          });
        }
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    } finally {
      setIsLoadingImage(false);
    }
  };
  
  // Add cleanup for preview URL
  useEffect(() => {
    return () => {
      // Cleanup preview URL when component unmounts
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reset selected file when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
    }
  }, [open]);
  
  // Add helper function to format time slots by day and type
  const formatTimeSlots = () => {
    const timeSlotsByDay = new Map();
    
    timingDetails.forEach(slot => {
      const day = slot.weekdays.name;
      if (!timeSlotsByDay.has(day)) {
        timeSlotsByDay.set(day, {
          'Dine In': { status: 0, time: '' },
          'Takeaway': { status: 0, time: '' },
          'Delivery': { status: 0, time: '' }
        });
      }
      
      const daySlots = timeSlotsByDay.get(day);
      const type = slot.order_types.type;
      const hours = slot.restaurant_time_slot_hours;
      
      if (hours && hours.length > 0) {
        daySlots[type] = {
          status: slot.status,
          time: `${hours[0].start_time} - ${hours[0].end_time}`
        };
      } else {
        daySlots[type] = {
          status: slot.status,
          time: 'Closed'
        };
      }
    });
    
    return timeSlotsByDay;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-primary text-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {viewOnly ? "View" : initialData ? "Edit" : "Add"} Location
            </DialogTitle>
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-4 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Captain Cookie Donatea"
                required
                className="border-gray-300"
                disabled={viewOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationType" className="text-gray-700">Location Type*</Label>
              <Select 
                value={formData.locationType || 'OUTLET'} 
                onValueChange={(value) => handleChange("locationType", value)}
                disabled={viewOnly}
              >
                <SelectTrigger id="locationType" className="border-gray-300">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUTLET">OUTLET</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Service Type*</Label>
              <div className="space-y-3 border border-gray-300 rounded-md p-3">
                {serviceTypes.map((serviceType) => {
                  const isChecked = Array.isArray(formData.serviceType) 
                    ? formData.serviceType.includes(serviceType.name)
                    : false;
                  
                  return (
                    <div key={serviceType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${serviceType.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => 
                          handleServiceTypeChange(serviceType.name, checked as boolean)
                        }
                        disabled={viewOnly}
                      />
                      <Label 
                        htmlFor={`service-${serviceType.id}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {serviceType.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {Array.isArray(formData.serviceType) && formData.serviceType.length > 0 && (
                <p className="text-xs text-gray-500">
                  Selected: {formData.serviceType.join(", ")}
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Address Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitNumber" className="text-gray-700">Unit Number*</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => handleChange("unitNumber", e.target.value)}
                    placeholder="e.g., 47"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streetName" className="text-gray-700">Street Name*</Label>
                  <Input
                    id="streetName"
                    value={formData.streetName}
                    onChange={(e) => handleChange("streetName", e.target.value)}
                    placeholder="e.g., Sesame Street"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-gray-700">Postcode*</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleChange("postcode", e.target.value)}
                    placeholder="e.g., 47945"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700">City*</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g., Boston"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-gray-700">Province*</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    placeholder="e.g., Victoria"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-700">Country*</Label>
                  <Input
                    id="country"
                    value={formData.country || 'Australia'}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="e.g., Australia"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-gray-700">Latitude*</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    placeholder="e.g., -37.8136"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-gray-700">Longitude*</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    placeholder="e.g., 144.9631"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Contact Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">Phone*</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="e.g., 0123456789"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alternatePhone" className="text-gray-700">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => handleChange("alternatePhone", e.target.value)}
                    placeholder="e.g., 0123456789"
                    className="border-gray-300"
                    disabled={viewOnly}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiverEmail" className="text-gray-700">Email for receiving orders*</Label>
                <Input
                  id="receiverEmail"
                  type="email"
                  value={formData.receiverEmail || formData.email}
                  onChange={(e) => {
                    handleChange("receiverEmail", e.target.value);
                    handleChange("email", e.target.value);
                  }}
                  placeholder="e.g., store@captaincookie.com"
                  className="border-gray-300"
                  required
                  disabled={viewOnly}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-700">Image*</Label>
              <div className="border border-gray-300 rounded-md p-4">
                {isLoadingImage ? (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative w-full h-40 bg-gray-50 rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Location" 
                          className="w-full h-full object-contain"
                        />
                        {!viewOnly && hasExistingImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={handleImageDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                        <span className="text-gray-500">No image uploaded</span>
                      </div>
                    )}
                    
                    {!viewOnly && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          id="image"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
                        </Button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Recommended: 800x800px, Max size: 5MB
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Timing Details</h3>
              {isLoadingTiming ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(formatTimeSlots()).map(([day, types]) => (
                    <div key={day} className="border rounded-md p-3">
                      <div className="font-medium mb-2">{day}</div>
                      {Object.entries(types).map(([type, data]: [string, any]) => (
                        <div key={type} className="flex justify-between items-center text-sm py-1">
                          <span className="text-gray-600">{type}:</span>
                          <span className={data.status === 0 ? "text-red-500" : ""}>
                            {data.status === 0 ? "Closed" : data.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div> */}
            
            <div className="flex items-center gap-2">
              <Label className="text-gray-700">Status</Label>
              <Switch 
                id="status" 
                checked={formData.status === "Active"}
                onCheckedChange={handleStatusChange}
                disabled={viewOnly}
              />
              <span className="text-sm text-gray-600">
                {formData.status}
              </span>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
            <div className="flex justify-end gap-2 w-full">
              {viewOnly ? (
                <Button 
                  type="button" 
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary text-white hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update" : "Create"} Location
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditLocationDialog;
