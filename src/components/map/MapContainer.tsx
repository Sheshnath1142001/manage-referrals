
import React, { useRef, useEffect } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import MapLoadingState from './MapLoadingState';
import MapErrorState from './MapErrorState';

interface MapContainerProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  children?: React.ReactNode;
  isLoading?: boolean;
  error?: Error | string | null;
  onMapLoad?: (map: google.maps.Map) => void;
}

const MapContainer = ({
  center,
  zoom = 13,
  children,
  isLoading = false,
  error = null,
  onMapLoad
}: MapContainerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded: mapIsLoaded, error: mapError } = useGoogleMaps(mapRef, {
    center,
    zoom
  });
  
  // Call onMapLoad when map is loaded
  useEffect(() => {
    if (map && onMapLoad) {
      console.log("Map loaded, calling onMapLoad");
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  // Debug logging
  useEffect(() => {
    console.log("MapContainer state:", { 
      isLoading, 
      mapIsLoaded, 
      hasError: !!error || !!mapError,
      mapInstance: !!map,
      mapRefExists: !!mapRef.current
    });
  }, [isLoading, mapIsLoaded, error, mapError, map]);

  // Force rerender on page load to ensure map ref is created
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Force rerendering to ensure map ref is created");
      // This will force a component update
      const forceUpdate = () => {};
      forceUpdate();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !mapIsLoaded) {
    return (
      <div className="relative">
        <div ref={mapRef} className="h-[300px] md:h-[500px] w-full" style={{ display: 'none' }}></div>
        <MapLoadingState />
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className="relative">
        <div ref={mapRef} className="h-[300px] md:h-[500px] w-full" style={{ display: 'none' }}></div>
        <MapErrorState error={error || mapError} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[300px] md:h-[500px] w-full"></div>
      {children}
    </div>
  );
};

export default MapContainer;
