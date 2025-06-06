import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer, CustomerAddress } from "@/services/api/customers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_no: z.string().min(8, "Phone number must be at least 8 characters"),
  country_code: z.string().optional(),
  username: z.string().optional(),
  status: z.boolean().default(true),
  customer_groups: z.array(z.string()).optional(),
  // Address fields
  unit_number: z.string().optional(),
  street_name: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
});

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  address?: CustomerAddress;
  customerGroups?: { label: string; value: string }[];
  isLoading?: boolean;
  isViewMode?: boolean;
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
}

export function CustomerDialog({ 
  open,
  onOpenChange,
  customer, 
  address, 
  customerGroups = [],
  isLoading = false,
  isViewMode = false,
  onSubmit 
}: CustomerDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      country_code: "",
      username: "",
      status: true,
      customer_groups: [],
      unit_number: "",
      street_name: "",
      postcode: "",
      city: "",
      province: "",
      country: "",
    },
  });

  useEffect(() => {
    if (customer && open) {
      // Handle customer groups mapping for form (need IDs for MultiSelect)
      let mappedGroups: string[] = [];
      if (customer.customer_groups && Array.isArray(customer.customer_groups)) {
        mappedGroups = customer.customer_groups.map(group => {
          // Handle different possible structures
          if (typeof group === 'object' && group !== null) {
            // Try different possible id fields
            return group.id?.toString() || group.value?.toString() || group.group_id?.toString() || '';
          }
          return group?.toString() || '';
        }).filter(Boolean); // Remove empty values
      }

      // Ensure all values are strings to prevent controlled/uncontrolled issues
      form.reset({
        name: customer.name || "",
        email: customer.email || "",
        phone_no: customer.phone_no || "",
        country_code: customer.country_code || "",
        username: customer.username || "",
        status: customer.status === 1,
        customer_groups: mappedGroups,
        unit_number: address?.unit_number || "",
        street_name: address?.street_name || "",
        postcode: address?.postcode || "",
        city: address?.city || "",
        province: address?.province || "",
        country: address?.country || "",
      });
    } else if (!customer && open) {
      // Reset form for new customer
      form.reset({
        name: "",
        email: "",
        phone_no: "",
        country_code: "",
        username: "",
        status: true,
        customer_groups: [],
        unit_number: "",
        street_name: "",
        postcode: "",
        city: "",
        province: "",
        country: "",
      });
    }
  }, [customer, address, form, open]);

  const handlePhoneChange = (value: string, data: any) => {
    form.setValue("phone_no", value.slice(data.dialCode.length));
    form.setValue("country_code", "+" + data.dialCode);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'View Customer' : (customer?.id === 'new' ? 'Add New Customer' : 'Edit Customer')}
          </DialogTitle>
          <DialogDescription>
            {isViewMode 
              ? 'View customer details and information.' 
              : customer?.id === 'new' 
                ? 'Add a new customer to your system.' 
                : 'Edit customer details and information.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Phone No.*</FormLabel>
                <Controller
                  control={form.control}
                  name="phone_no"
                  render={({ field: { value } }) => (
                    <PhoneInput
                      country={'au'}
                      value={(form.getValues("country_code") || "") + (value || "")}
                      onChange={handlePhoneChange}
                      disabled={isViewMode}
                      enableSearch
                      inputProps={{
                        required: true,
                        className: "!w-full !pl-[75px]"
                      }}
                      buttonClass="!border-r-0 !w-[65px]"
                      containerClass="!mb-1"
                      preferredCountries={['au', 'us', 'gb', 'nz']}
                    />
                  )}
                />
                <FormMessage>{form.formState.errors.phone_no?.message}</FormMessage>
              </FormItem>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Name*</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isViewMode}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Details:</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unit_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number*</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="street_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Name*</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode*</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province*</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Customer Groups - Multiple Selection */}
            {(customerGroups.length > 0 || (isViewMode && customer?.customer_groups?.length > 0)) && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Customer Groups:</h3>
                <FormField
                  control={form.control}
                  name="customer_groups"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {isViewMode ? (
                          <div className="p-2 border rounded-md bg-muted/50">
                            {customer?.customer_groups?.length > 0 ? (
                              customer.customer_groups.map((group: any) => group.name || group).join(', ')
                            ) : (
                              'No groups assigned'
                            )}
                          </div>
                        ) : (
                          <MultiSelect
                            options={customerGroups}
                            onChange={field.onChange}
                            value={field.value || []}
                            placeholder="Select customer groups"
                            disabled={isViewMode}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {!isViewMode && (
              <DialogFooter className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 