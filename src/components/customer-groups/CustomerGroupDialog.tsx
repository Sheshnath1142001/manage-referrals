import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CustomerGroup } from "@/services/api/customerGroups";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Users, Search, CheckCircle, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { Customer } from "@/services/api/customers";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  status: z.boolean().default(true),
  customers: z.array(z.string()).optional()
});

type FormValues = {
  name: string;
  description?: string;
  status: boolean;
  customers?: string[];
  user_ids?: string[];
};

interface CustomerGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name?: string; status: number; description?: string; user_ids: string[] }) => void;
  customerGroup?: CustomerGroup;
  isSubmitting: boolean;
}

export const CustomerGroupDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  customerGroup, 
  isSubmitting 
}: CustomerGroupDialogProps) => {
  const isEditing = !!customerGroup;
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  
  const { customers, isLoading: customersLoading } = useCustomers();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: true,
      customers: []
    },
  });

  // Reset form values whenever dialog opens or customerGroup changes
  useEffect(() => {
    if (isOpen) {
      if (customerGroup) {
        // For editing - populate form with existing data
        form.reset({
          name: customerGroup.name || "",
          description: customerGroup.description || "",
          status: customerGroup.status === 1,
          customers: []
        });
      } else {
        // For creating - reset to empty values
        form.reset({
          name: "",
          description: "",
          status: true,
          customers: []
        });
      }
    }
  }, [isOpen, customerGroup, form]);

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone_no?.toLowerCase().includes(search)
    );
  });

  // Handle customer selection when dialog opens
  useEffect(() => {
    if (isOpen && customerGroup && customers.length > 0) {
      const customerIds = customerGroup.customer_groups_users?.map(u => u.user_id) || [];
      
      if (customerIds.length === customers.length && customerIds.every(id => customers.some(c => c.id === id))) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      const selectedCustomerList = customers.filter(c => 
        customerIds.includes(c.id)
      );
      
      setSelectedCustomers(selectedCustomerList);
      
      form.setValue('customers', customerIds);
    } else if (isOpen && !customerGroup) {
      setSelectedCustomers([]);
      setSelectAll(false);
      form.setValue('customers', []);
    }
  }, [isOpen, customerGroup, customers, form]);

  const handleSubmit = (values: FormValues) => {
    const formattedData = {
      ...values,
      status: values.status ? 1 : 0,
      user_ids: selectedCustomers.map(c => c.id)
    };
    
    
    onSubmit(formattedData);
  };

  const toggleCustomerSelection = () => {
    setShowCustomerSelection(!showCustomerSelection);
    if (showCustomerSelection) {
      setSearchTerm("");
    }
  };

  const isCustomerSelected = (customerId: string) => {
    return selectedCustomers.some(c => c.id === customerId);
  };

  const toggleCustomerSelection2 = (customer: Customer) => {
    setSelectedCustomers(prev => {
      const isAlreadySelected = prev.some(c => c.id === customer.id);
      
      if (isAlreadySelected) {
        const updatedList = prev.filter(c => c.id !== customer.id);
        form.setValue('customers', updatedList.map(c => c.id));
        setSelectAll(false);
        return updatedList;
      } else {
        const updatedList = [...prev, customer];
        form.setValue('customers', updatedList.map(c => c.id));
        setSelectAll(updatedList.length === customers.length);
        return updatedList;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
      form.setValue('customers', []);
      setSelectAll(false);
    } else {
      setSelectedCustomers([...customers]);
      form.setValue('customers', customers.map(c => c.id));
      setSelectAll(true);
    }
  };

  const handleApplySelection = () => {
    const customerIds = selectedCustomers.map(c => c.id);
    form.setValue('customers', customerIds);
    setShowCustomerSelection(false);
  };

  const removeSelectedCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      const updatedList = prev.filter(c => c.id !== customerId);
      form.setValue('customers', updatedList.map(c => c.id));
      setSelectAll(false);
      return updatedList;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Customer Group" : "Create Customer Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of this customer group and manage its members."
              : "Create a new customer group and assign customers to it."}
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-2" />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} className="bg-gray-100" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter group description (optional)" 
                      className="h-24 resize-none bg-gray-100" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel className="font-medium">Customer Selection</FormLabel>
              <Button
                type="button"
                className="w-full justify-center gap-2 bg-white border border-gray-300"
                variant="outline"
                onClick={toggleCustomerSelection}
              >
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-blue-600 font-medium">SELECT CUSTOMERS</span>
              </Button>
              
              <div className="mt-2">
                {selectedCustomers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No customers selected</p>
                ) : selectAll ? (
                  <Badge 
                    variant="secondary"
                    className="flex items-center gap-1 pl-2 pr-1 py-1 bg-blue-100 text-blue-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    All Customers ({customers.length})
                  </Badge>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomers.map(customer => (
                      <Badge 
                        key={customer.id} 
                        variant="secondary"
                        className="flex items-center gap-1 pl-2 pr-1 py-1 bg-gray-100"
                      >
                        {customer.name}
                        <button 
                          type="button" 
                          onClick={() => removeSelectedCustomer(customer.id)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <div className="flex items-center gap-4 py-2">
                  <span className="font-medium">Status</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className="text-gray-700">{field.value ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              )}
            />
            
            <Separator className="my-2" />
            
            <DialogFooter className="gap-2 sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-white"
              >
                CANCEL
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "SAVING..." : isEditing ? "UPDATE" : "CREATE"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {showCustomerSelection && (
          <Dialog open={showCustomerSelection} onOpenChange={setShowCustomerSelection}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
              <div className="flex flex-col h-[600px]">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">Select Customers</h2>
                  <DialogTitle className="sr-only">Select Customers</DialogTitle>
                  <DialogDescription className="sr-only">
                    Select customers to include in this group. You can search for specific customers or select all of them at once.
                  </DialogDescription>
                </div>

                <div className="p-4 border-b">
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search customers..." 
                        className="pl-10 bg-gray-100"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant={selectAll ? "default" : "outline"}
                      size="sm"
                      className={selectAll ? "bg-blue-600" : ""}
                      onClick={handleSelectAll}
                    >
                      {selectAll ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {customersLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading customers...</p>
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p>No customers found</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer mb-2 bg-blue-50 border border-blue-200`}
                      >
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          className="mr-2"
                          id="select-all-customers"
                        />
                        <div className="ml-2 flex items-center">
                          <CheckCircle className={`h-4 w-4 mr-2 ${selectAll ? 'text-blue-600' : 'text-gray-300'}`} />
                          <div className="font-medium">All Customers ({customers.length})</div>
                        </div>
                      </div>
                      
                      {filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className={`flex items-center p-2 rounded cursor-pointer ${
                            isCustomerSelected(customer.id) ? 'bg-blue-50' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => toggleCustomerSelection2(customer)}
                        >
                          <Checkbox 
                            checked={isCustomerSelected(customer.id)}
                            className="mr-2"
                            id={`customer-${customer.id}`}
                          />
                          <div className="ml-2">
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              {customer.email || customer.phone_no}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t flex justify-between">
                  <div className="text-sm">
                    {selectAll ? 
                      `All customers selected (${customers.length})` : 
                      `${selectedCustomers.length} of ${customers.length} customers selected`
                    }
                  </div>
                  <div className="flex gap-2">
                  <Button
                      type="button"
                    variant="outline"
                    onClick={() => setShowCustomerSelection(false)}
                  >
                      Cancel
                  </Button>
                  <Button
                      type="button"
                    onClick={handleApplySelection}
                  >
                      Apply
                  </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};