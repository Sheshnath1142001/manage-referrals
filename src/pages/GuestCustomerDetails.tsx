
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { guestCustomersApi, GuestCustomer } from "@/services/api/guestCustomers";
import { useToast } from "@/hooks/use-toast";

const GuestCustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<GuestCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await guestCustomersApi.getGuestCustomer(id);
        // The API might return the data wrapped in a data property or directly
        const customerData = typeof response === 'object' && response !== null
          ? (response.data || response)
          : null;
          
        setCustomer(customerData as GuestCustomer);
      } catch (error) {
        
        toast({
          title: "Error",
          description: "Could not load customer details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id, toast]);

  const handleEdit = () => {
    if (customer) {
      navigate(`/guest-customers/edit/${customer.id}`);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this guest customer?");
    if (!confirmed) return;
    
    try {
      await guestCustomersApi.deleteGuestCustomer(customer.id);
      toast({
        title: "Success",
        description: "Guest customer deleted successfully.",
      });
      navigate("/guest-customers");
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete guest customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/guest-customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guest Customers
          </Button>
        </div>
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Loading Guest Customer...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/guest-customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guest Customers
          </Button>
        </div>
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Guest Customer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The guest customer you're looking for could not be found or might have been deleted.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/guest-customers")}
            >
              Return to Guest Customers List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/guest-customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Guest Customers
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{customer.name}</CardTitle>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              customer.status === 'Active' || customer.status === 1 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {customer.status === 'Active' || customer.status === 1 ? 'Active' : 'Inactive'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div>{customer.email || '—'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div>{customer.phone || '—'}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Location</h3>
              <Separator className="mb-4" />
              
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div>{customer.address || '—'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestCustomerDetails;
