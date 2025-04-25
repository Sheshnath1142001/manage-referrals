
import React from 'react';

const MapLoadingState = () => {
  return (
    <div className="h-[300px] md:h-[500px] flex justify-center items-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-food-green border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
