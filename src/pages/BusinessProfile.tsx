
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin, Clock, Phone, Mail, Star, MessageSquare } from "lucide-react";
import { getFoodTruckById } from "@/lib/foodTruckService";
import { getMenuItems } from "@/lib/menuService";
import { getLocations } from "@/lib/locationService";
import { getOperatingHours } from "@/lib/operatingHoursService";
import { getReviews } from "@/lib/reviewService";
import { FoodTruck, MenuItem, Location, OperatingHours, Review, MenuItemListResponse, LocationListResponse } from "@/lib/types.d";
import { checkIsOpen } from "@/components/map/utils/mapUtils";

const BusinessProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [foodTruck, setFoodTruck] = useState<FoodTruck | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch food truck data
        const truckData = await getFoodTruckById(id || "");
        setFoodTruck(truckData);

        // Fetch menu items
        const menuData: MenuItemListResponse = await getMenuItems(truckData.id);
        setMenuItems(menuData.items);

        // Fetch locations
        const locationData: LocationListResponse = await getLocations(truckData.id);
        setLocations(locationData.items);

        // Fetch operating hours
        const hoursData = await getOperatingHours(truckData.id);
        setOperatingHours(hoursData);

        // Fetch reviews
        const reviewData = await getReviews(truckData.id);
        setReviews(reviewData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load business information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!foodTruck) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
            <CardDescription>
              The requested food truck business could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isOpen = operatingHours ? checkIsOpen(operatingHours) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{foodTruck.name}</h1>
            <p className="text-muted-foreground">{foodTruck.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>
                  {foodTruck.location.address ? foodTruck.location.address : "Address not available"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Phone not available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email not available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{isOpen ? "Open Now" : "Closed"}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="font-semibold mt-2">${item.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location) => (
              <Card key={location.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{location.name || "Location"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {location.address}
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      <MapPin className="mr-2 h-4 w-4" />
                      View on Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">{review.rating}/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm font-medium">{review.userName}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessProfile;
