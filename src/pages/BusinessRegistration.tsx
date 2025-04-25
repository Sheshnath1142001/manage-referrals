import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard } from "lucide-react";
import { createFoodTruck } from "@/lib/foodTruckService";
import { FoodTruck } from "@/lib/types.d";
import { loadStripe } from "@stripe/stripe-js";
import { createSubscription } from "@/lib/paymentService";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Form validation schema
const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cuisineType: z.string().min(2, "Please specify the cuisine type"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  zipCode: z.string().min(5, "Please enter a valid zip code"),
});

type BusinessValues = z.infer<typeof businessSchema>;

const BusinessRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      description: "",
      cuisineType: "",
      phoneNumber: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // Handle payment submission
  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      // Create subscription
      const { clientSecret, subscriptionId } = await createSubscription(100, "month");

      // Confirm payment
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);
      if (stripeError) {
        throw new Error(stripeError.message);
      }

      return subscriptionId;
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      return null;
    }
  };

  // Handle form submission
  const onSubmit = async (values: BusinessValues) => {
    setIsLoading(true);
    try {
      // First, process payment
      const subscriptionId = await handlePayment();
      if (!subscriptionId) {
        return;
      }

      const businessData: Partial<FoodTruck> = {
        name: values.name,
        description: values.description,
        cuisineType: values.cuisineType,
        phone: values.phoneNumber,
        location: {
          latitude: 0, // placeholder values
          longitude: 0, // placeholder values
          address: values.address,
          city: values.city,
          state: values.state,
          postalCode: values.zipCode,
        },
        subscriptionId // Add subscription ID to food truck data
      };

      await createFoodTruck(businessData as any);

      toast({
        title: "Success",
        description: "Your business has been registered successfully",
      });

      // Redirect to business dashboard
      navigate("/owner-dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to register business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register Your Food Truck Business</CardTitle>
          <CardDescription>
            Fill out the form below to register your food truck business. A $1 monthly subscription is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your business name" {...field} disabled={isLoading} />
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
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your food truck business"
                        className="min-h-[100px]"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cuisineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mexican, Italian, etc." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} disabled={isLoading} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your business address" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP Code" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Register & Pay $1/month
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessRegistration;
