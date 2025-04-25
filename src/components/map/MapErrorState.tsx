
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapErrorStateProps {
  error: Error | string | null;
}

const MapErrorState = ({ error }: MapErrorStateProps) => {
  return (
    <div className="h-[300px] md:h-[500px] flex justify-center items-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <MapPin className="h-12 w-12 text-food-coral mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Location access needed</h3>
        <p className="text-gray-500 mb-4">
          Please allow location access to see food trucks near you.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-food-green hover:bg-food-green/90"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default MapErrorState;
