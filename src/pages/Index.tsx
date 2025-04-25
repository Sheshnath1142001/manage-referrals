
import { useQuery } from "@tanstack/react-query";
import HeroBanner from "@/components/home/HeroBanner";
import HowItWorks from "@/components/home/HowItWorks";
import FoodTruckTabs from "@/components/home/FoodTruckTabs";
import OwnerCTA from "@/components/home/OwnerCTA";
import MapView from "@/components/home/MapView";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllFoodTrucks } from "@/lib/foodTruckService";
import { getNearbyFoodTrucks } from "@/lib/locationService";
import { getPopularTags } from "@/lib/tagService";
import { Loader2 } from "lucide-react";
import { FoodTruck, Tag } from "@/lib/types.d";

const Index = () => {
  const isMobile = useIsMobile();

  // Fetch popular food trucks
  const {
    data: popularFoodTrucks,
    isLoading: isLoadingPopular,
    error: popularError
  } = useQuery({
    queryKey: ['popularFoodTrucks'],
    queryFn: async () => {
      console.log('Fetching popular food trucks...');
      try {
        const response = await getAllFoodTrucks({
          limit: 6,
          sort: 'rating',
          isActive: true
        });
        console.log('Popular food trucks response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching popular food trucks:', error);
        throw error;
      }
    },
  });

  // Fetch nearby food trucks
  const {
    data: nearbyFoodTrucks,
    isLoading: isLoadingNearby,
    error: nearbyError
  } = useQuery({
    queryKey: ['nearbyFoodTrucks'],
    queryFn: async () => {
      console.log('Fetching nearby food trucks...');
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const response = await getNearbyFoodTrucks({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            distance: 10,
            limit: 6
          });
          console.log('Nearby food trucks response:', response);
          return response;
        } catch (error) {
          console.error('Error getting location or fetching nearby trucks:', error);
          const fallbackResponse = await getAllFoodTrucks({ limit: 6 });
          console.log('Fallback response:', fallbackResponse);
          return fallbackResponse;
        }
      } else {
        const fallbackResponse = await getAllFoodTrucks({ limit: 6 });
        console.log('Geolocation not supported, fallback response:', fallbackResponse);
        return fallbackResponse;
      }
    },
  });

  // Fetch popular tags
  const {
    data: popularTags,
    isLoading: isLoadingTags,
    error: tagsError
  } = useQuery({
    queryKey: ['popularTags'],
    queryFn: async () => {
      console.log('Fetching popular tags...');
      try {
        const response = await getPopularTags(10);
        console.log('Popular tags response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching popular tags:', error);
        throw error;
      }
    },
  });

  // Show loading state
  if (isLoadingPopular || isLoadingNearby || isLoadingTags) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-food-orange" />
        <p className="mt-4 text-gray-600">Loading food trucks...</p>
      </div>
    );
  }

  // Show error state
  if (popularError || nearbyError || tagsError) {
    const error = popularError || nearbyError || tagsError;
    console.error('Error in Index component:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to load food trucks'}
          </p>
          <p className="text-sm text-gray-500">
            Please make sure the backend server is running at {import.meta.env.VITE_API_BASE_URL}
          </p>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-sm overflow-auto max-w-full">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  console.log('Rendering with data:', {
    popularFoodTrucks: popularFoodTrucks?.items,
    nearbyFoodTrucks: nearbyFoodTrucks?.items,
    popularTags
  });

  return (
    <div className={`flex flex-col min-h-screen ${isMobile ? 'space-y-8' : 'space-y-12'}`}>
      <HeroBanner />
      <HowItWorks />
      <FoodTruckTabs
        popularFoodTrucks={(popularFoodTrucks?.items || []) as FoodTruck[]}
        nearbyFoodTrucks={(nearbyFoodTrucks?.items || []) as FoodTruck[]}
        popularTags={(popularTags || []) as Tag[]}
      />
      <MapView foodTrucks={(nearbyFoodTrucks?.items || []) as FoodTruck[]} />
      <OwnerCTA />
    </div>
  );
};

export default Index;
