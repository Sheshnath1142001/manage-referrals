
import React, { useEffect, useState, useCallback, memo } from "react";
import { FoodTruck } from "../../lib/types";
import InfoWindowHandler from "./utils/InfoWindowHandler";
import { Skeleton } from "../ui/skeleton";
import "./markerStyles.css";

interface MapMarkersProps {
  trucks: FoodTruck[];
  onTruckSelect?: (truckId: string | null) => void;
  selectedTruck?: string | null;
  isLoading?: boolean;
  onTruckHover?: (truck: FoodTruck | null) => void;
  map?: google.maps.Map | null;
  location?: { latitude: number; longitude: number } | null;
  onTruckClick?: (truckId: string) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = memo(({
  trucks,
  onTruckSelect,
  selectedTruck,
  isLoading = false,
  onTruckHover,
  onTruckClick
}) => {
  const [hoveredTruck, setHoveredTruck] = useState<FoodTruck | null>(null);
  
  // Memoize the marker click handler
  const handleMarkerClick = useCallback((truck: FoodTruck) => {
    if (onTruckSelect) {
      onTruckSelect(truck.id);
    }
    if (onTruckClick) {
      onTruckClick(truck.id);
    }
  }, [onTruckSelect, onTruckClick]);

  // Memoize the marker hover handler
  const handleMarkerHover = useCallback((truck: FoodTruck | null) => {
    setHoveredTruck(truck);
    if (onTruckHover) {
      onTruckHover(truck);
    }
  }, [onTruckHover]);
  
  if (isLoading) {
    return <div className="marker-skeleton"><Skeleton className="w-8 h-8 rounded-full" /></div>;
  }

  return (
    <>
      {trucks.map((truck) => {
        // Create markers here using Google Maps API
        // This is a simplified version - actual implementation depends on your Google Maps setup
        const position = { lat: truck.location.latitude, lng: truck.location.longitude };
        
        // For each truck, we would create a marker, add click listeners, etc.
        // Here we're returning JSX for demonstration, but with Google Maps you'd create actual markers
        return (
          <div 
            key={truck.id}
            className="marker"
            onClick={() => handleMarkerClick(truck)}
            onMouseEnter={() => handleMarkerHover(truck)}
            onMouseLeave={() => handleMarkerHover(null)}
          >
            {hoveredTruck?.id === truck.id && (
              <div className="info-window">
                <InfoWindowHandler truck={truck} isHovered={true} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
});

MapMarkers.displayName = "MapMarkers";

export default MapMarkers;
