import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer, CustomerAddress } from "@/services/api/customers";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { User, MapPin, Users, Mail, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_no: z.string().min(8, "Phone number must be at least 8 characters"),
  country_code: z.string().optional(),
  customer_groups: z.array(z.string()).optional(),
  // Address fields
  unit_number: z.string().optional(),
  street_name: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
});

interface CustomerFormProps {
  customer?: Customer;
  address?: CustomerAddress;
  customerGroups?: { label: string; value: string }[];
  isLoading?: boolean;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function CustomerForm({ 
  customer, 
  address, 
  customerGroups = [],
  isLoading,
  onSubmit 
}: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      country_code: "",
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
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email,
        phone_no: customer.phone_no,
        country_code: customer.country_code || "",
        customer_groups: customer.customer_groups?.map(g => g.id) || [],
      });
    }
    if (address) {
      form.setValue("unit_number", address.unit_number);
      form.setValue("street_name", address.street_name);
      form.setValue("postcode", address.postcode);
      form.setValue("city", address.city);
      form.setValue("province", address.province);
      form.setValue("country", address.country);
    }
  }, [customer, address, form]);

  const handlePhoneChange = (value: string, data: any) => {
    form.setValue("phone_no", value.slice(data.dialCode.length));
    form.setValue("country_code", "+" + data.dialCode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{customer?.id === 'new' ? 'Add New Customer' : 'Edit Customer'}</CardTitle>
              <CardDescription>Update customer information or address details</CardDescription>
              <TabsList className="mt-2 w-full justify-start">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <User size={16} /> Customer Details
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2">
                  <MapPin size={16} /> Address Information
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="details" className="mt-0 pt-2">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormDescription>
                            Customer's full name as it should appear
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail size={14} /> Email Address
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Primary contact email for the customer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel className="flex items-center gap-2">
                      <Phone size={14} /> Phone Number
                    </FormLabel>
                    <Controller
                      control={form.control}
                      name="phone_no"
                      render={({ field: { value, onChange } }) => (
                        <PhoneInput
                          country={'au'}
                          value={(form.getValues("country_code") || "") + value}
                          onChange={handlePhoneChange}
                          enableSearch
                          searchPlaceholder="Search country..."
                          inputProps={{
                            required: true,
                            className: "!w-full !pl-[75px]"
                          }}
                          buttonClass="!border-r-0 !w-[65px]"
                          containerClass="!mb-1 phone-input-container"
                          dropdownClass="country-dropdown"
                          searchClass="!w-[calc(100%-20px)] !mx-[10px] !my-[10px]"
                          preferredCountries={['au', 'us', 'gb', 'nz']}
                          countryCodeEditable={false}
                        />
                      )}
                    />
                    <FormDescription>
                      Include country code for international dialing
                    </FormDescription>
                    <FormMessage>{form.formState.errors.phone_no?.message}</FormMessage>
                  </div>

                  {customerGroups.length > 0 && (
                    <div>
                      <FormField
                        control={form.control}
                        name="customer_groups"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users size={14} /> Customer Groups
                            </FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={customerGroups}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select customer groups"
                              />
                            </FormControl>
                            <FormDescription>
                              Assign to groups for targeted promotions and notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="address" className="mt-0 pt-2">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="unit_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt 123" {...field} />
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
                          <FormLabel>Street Name</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province/State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
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
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </Tabs>
      </form>
    </Form>
  );
} 