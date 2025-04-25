
import { useState, useEffect, useRef } from "react";

interface MapOptions {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

interface UseGoogleMapsResult {
  map: google.maps.Map | null;
  isLoaded: boolean;
  error: Error | null;
}

export const useGoogleMaps = (
  ref: React.RefObject<HTMLDivElement>,
  options: MapOptions
): UseGoogleMapsResult => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mapsApiLoadedRef = useRef(false);
  const initAttempts = useRef(0);

  useEffect(() => {
    // Debug logging
    console.log("useGoogleMaps: Starting map initialization");
    console.log("Map container ref exists:", !!ref.current);
    
    // Function to check if Google Maps API is available
    const checkGoogleMapsApiLoaded = () => {
      console.log("Checking if Google Maps API is loaded");
      
      if (window.google && window.google.maps) {
        console.log("Google Maps API is available");
        mapsApiLoadedRef.current = true;
        initializeMapWithRetry();
      } else {
        console.log("Google Maps API not yet available, waiting...");
        // If not yet loaded, wait and check again
        setTimeout(checkGoogleMapsApiLoaded, 500);
      }
    };

    const initializeMapWithRetry = () => {
      if (!ref.current) {
        console.log(`Map container ref is not available, attempt ${initAttempts.current + 1}`);
        
        // If we've tried less than 10 times, try again after a delay
        if (initAttempts.current < 10) {
          initAttempts.current += 1;
          setTimeout(initializeMapWithRetry, 500);
          return;
        } else {
          console.error("Failed to initialize map after multiple attempts - container not available");
          setError(new Error("Map container not available"));
          return;
        }
      }
      
      try {
        console.log("Initializing map with options:", options);
        // Create map with options that are defined in the Google Maps type definitions
        const mapOptions: google.maps.MapOptions = {
          center: { lat: options.center.lat, lng: options.center.lng },
          zoom: options.zoom,
          mapTypeControl: true,
          streetViewControl: false,
          // fullscreenControl has been removed as it's not in the MapOptions interface
        };
        
        const newMap = new window.google.maps.Map(ref.current, mapOptions);
        
        console.log("Map created successfully");
        setMap(newMap);
        setIsLoaded(true);
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setError(err instanceof Error ? err : new Error("Unknown error initializing map"));
      }
    };

    checkGoogleMapsApiLoaded();

    return () => {
      // No need to clean up the map instance as Google Maps API handles that
      console.log("useGoogleMaps: Cleaning up");
    };
  }, [ref, options]);

  return { map, isLoaded, error };
};
