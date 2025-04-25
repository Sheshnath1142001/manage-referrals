
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import MapContainer from "@/components/map/MapContainer";
import MapOverlay from "@/components/map/MapOverlay";
import MapMarkers from "@/components/map/MapMarkers";
import { FoodTruck } from "@/lib/types";

interface MapViewProps {
  foodTrucks: FoodTruck[];
}

const MapView = ({ foodTrucks = [] }: MapViewProps) => {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(error.message);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  }, []);

  const navigateToTruck = (truckId: string) => {
    navigate(`/food-trucks/${truckId}`);
  };

  // Callback function to get map instance from MapContainer
  const handleMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);

    // Add a small delay to ensure the map is fully rendered
    setTimeout(() => {
      setIsMapReady(true);
    }, 500);
  };

  // Prepare trucks for display on the map
  const trucksWithLocation = foodTrucks.map(truck => ({
    ...truck,
    location: {
      latitude: truck.location.latitude,
      longitude: truck.location.longitude,
      address: truck.location.address,
      city: truck.location.city || '',
      state: truck.location.state || '',
      country: truck.location.country || '',
      postalCode: truck.location.postalCode || ''
    }
  }));

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-food-green font-viga">
          Food Trucks Near You
        </h2>
        <p className="text-gray-600 mb-6">
          Explore delicious options in your area
        </p>

        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <MapContainer
            center={{
              lat: userLocation?.latitude || 37.7749,
              lng: userLocation?.longitude || -122.4194
            }}
            isLoading={locationLoading}
            error={locationError}
            onMapLoad={handleMapLoad}
          >
            {mapInstance && (
              <>
                <MapOverlay />
                {isMapReady && (
                  <MapMarkers
                    trucks={trucksWithLocation}
                    onTruckSelect={setSelectedTruck}
                    selectedTruck={selectedTruck}
                    onTruckClick={navigateToTruck}
                  />
                )}
              </>
            )}
          </MapContainer>
        </div>

        <div className="mt-4 md:mt-6 text-center">
          <Button
            onClick={() => navigate('/search')}
            variant="outline"
            className="border-food-green text-food-green hover:bg-food-green/10"
          >
            View All Food Trucks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MapView;
