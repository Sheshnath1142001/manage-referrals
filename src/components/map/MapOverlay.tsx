
import React from 'react';

const MapOverlay = () => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-lg p-3 md:p-4 shadow-lg max-w-full md:max-w-md text-sm md:text-base">
      <h3 className="font-semibold mb-1 md:mb-2">How to use this map</h3>
      <ul className="text-xs md:text-sm text-gray-600 space-y-1">
        <li className="flex items-start">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500 flex-shrink-0 mr-2 mt-0.5"></div>
          <span>Blue marker shows your location</span>
        </li>
        <li className="flex items-start">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-500 flex-shrink-0 mr-2 mt-0.5"></div>
          <span>Red markers show nearby food trucks</span>
        </li>
        <li className="flex items-start">
          <span>Click on a marker to see details</span>
        </li>
      </ul>
    </div>
  );
};

export default MapOverlay;
