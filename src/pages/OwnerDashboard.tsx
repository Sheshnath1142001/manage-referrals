import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFoodTrucks, FoodTruck } from "@/lib/foodTruckService";
import { getFoodTruckBookings } from "@/lib/bookingService";
import { getCurrentUser, isOwner, isAuthenticated } from "@/lib/authService";
import { Settings, Truck, Calendar, MapPin, MessageSquare, Star, PieChart, Upload, Edit, Plus, AlertTriangle, Loader2, Image, Phone, Mail } from "lucide-react";
import { getFoodTruckById, updateFoodTruck } from "@/lib/foodTruckService";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/menuService";
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/lib/locationService";
import { getOperatingHours, updateOperatingHours } from "@/lib/operatingHoursService";
import { MenuItem, Location, OperatingHours } from "@/lib/types";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [foodTruck, setFoodTruck] = useState<FoodTruck | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);

  // Check if user is authenticated and is an owner
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the owner dashboard.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!isOwner()) {
      toast({
        title: "Access Denied",
        description: "Only food truck owners can access this dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [navigate, toast]);

  // Fetch user's food trucks
  const { data: foodTrucks, isLoading: foodTrucksLoading, error } = useQuery({
    queryKey: ["userFoodTrucks"],
    queryFn: getUserFoodTrucks,
    enabled: isAuthenticated() && isOwner(),
  });

  // Set first truck as selected when data loads
  useEffect(() => {
    if (foodTrucks && foodTrucks.length > 0 && !selectedTruck) {
      setSelectedTruck(foodTrucks[0].id);
    }
  }, [foodTrucks, selectedTruck]);

  // Fetch bookings for selected truck
  const { data: bookings } = useQuery({
    queryKey: ["truckBookings", selectedTruck],
    queryFn: () => (selectedTruck ? getFoodTruckBookings(selectedTruck) : Promise.resolve({ items: [] })),
    enabled: !!selectedTruck,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch food truck data
        const truckData = await getFoodTruckById("current-user-id"); // Replace with actual user ID
        setFoodTruck(truckData);

        // Fetch menu items
        const menuData = await getMenuItems(truckData.id);
        setMenuItems(menuData);

        // Fetch locations
        const locationData = await getLocations(truckData.id);
        setLocations(locationData);

        // Fetch operating hours
        const hoursData = await getOperatingHours(truckData.id);
        setOperatingHours(hoursData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your food trucks. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-food-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!foodTruck) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>No Business Found</CardTitle>
            <CardDescription>
              You haven't registered a food truck business yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/business-registration")}>
              Register Your Business
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-600">Manage your food trucks and business</p>
        </div>
        <Button onClick={() => navigate("/add-food-truck")} className="bg-food-orange hover:bg-food-orange/90">
          <Plus className="mr-2 h-4 w-4" />
          Add New Food Truck
        </Button>
      </div>

      {foodTrucks && foodTrucks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with food truck list */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Food Trucks</CardTitle>
                <CardDescription>Select a truck to manage</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {foodTrucks.map((truck) => (
                    <button
                      key={truck.id}
                      onClick={() => setSelectedTruck(truck.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedTruck === truck.id ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 mr-3">
                          {truck.logo ? (
                            <img
                              src={truck.logo}
                              alt={truck.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Truck className="h-6 w-6 m-2 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium truncate">{truck.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Badge
                              variant={truck.status === "active" ? "default" : "outline"}
                              className={truck.status === "active" ? "bg-green-500" : ""}
                            >
                              {truck.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button variant="outline" className="w-full" onClick={() => navigate("/account-settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {selectedTruck ? (
              <>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <OverviewTab
                      truck={foodTrucks.find((t) => t.id === selectedTruck)!}
                      bookingCount={bookings?.items.length || 0}
                      onEdit={() => navigate(`/edit-food-truck/${selectedTruck}`)}
                    />
                  </TabsContent>

                  <TabsContent value="bookings">
                    <BookingsTab bookings={bookings?.items || []} />
                  </TabsContent>

                  <TabsContent value="menu">
                    <div className="text-center py-8">
                      <Button onClick={() => navigate(`/edit-menu/${selectedTruck}`)}>
                        Manage Menu Items
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="locations">
                    <div className="text-center py-8">
                      <Button onClick={() => navigate(`/edit-locations/${selectedTruck}`)}>
                        Manage Locations
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <div className="text-center py-8">
                      <Button onClick={() => navigate(`/view-reviews/${selectedTruck}`)}>
                        View All Reviews
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center p-8">
                <CardContent className="text-center">
                  <h3 className="text-xl font-medium mb-2">No Food Trucks Yet</h3>
                  <p className="text-gray-500 mb-4">Add your first food truck to get started</p>
                  <Button onClick={() => navigate("/add-food-truck")} className="bg-food-orange hover:bg-food-orange/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Food Truck
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md text-center p-6">
            <CardHeader>
              <CardTitle>Welcome to Tasty Truck Hub!</CardTitle>
              <CardDescription>You haven't added any food trucks yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Get started by adding your first food truck to showcase your business to hungry customers.
              </p>
              <Button onClick={() => navigate("/add-food-truck")} className="bg-food-orange hover:bg-food-orange/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Food Truck
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({
  truck,
  bookingCount,
  onEdit
}: {
  truck: FoodTruck;
  bookingCount: number;
  onEdit: () => void;
}) => {
  const metrics = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      value: bookingCount,
      label: "Active Bookings"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      value: truck.averageRating?.toFixed(1) || "N/A",
      label: "Average Rating"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
      value: truck.totalRatings || 0,
      label: "Reviews"
    },
    {
      icon: <PieChart className="h-8 w-8 text-green-500" />,
      value: truck.menuItems?.length || 0,
      label: "Menu Items"
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">{truck.name}</h2>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">{metric.icon}</div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Status: </span>
                <Badge
                  variant={truck.status === "active" ? "default" : "outline"}
                  className={truck.status === "active" ? "bg-green-500" : ""}
                >
                  {truck.status}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Cuisine Type: </span>
                <span>{truck.cuisineType}</span>
              </div>
              <div>
                <span className="font-medium">Phone: </span>
                <span>{truck.phone || "Not provided"}</span>
              </div>
              <div>
                <span className="font-medium">Website: </span>
                <span>{truck.website || "Not provided"}</span>
              </div>
              {truck.locations && truck.locations.length > 0 && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-1" />
                  <span>Current location: {truck.locations[0].address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Update Menu
            </Button>
            <Button variant="outline" className="justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Update Location
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Manage Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Bookings Tab Component
const BookingsTab = ({ bookings = [] }: { bookings: any[] }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-medium">{booking.eventName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.eventDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                    </p>
                    <p className="text-sm">{booking.location.address}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Badge
                      variant={booking.status === "confirmed" ? "default" : "outline"}
                      className={booking.status === "confirmed" ? "bg-green-500" : ""}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No upcoming bookings found.</p>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
