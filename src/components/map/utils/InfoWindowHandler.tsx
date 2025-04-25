import React, { useEffect, useRef } from "react";
import { FoodTruck } from "../../../lib/types";
import { checkIsOpen } from './mapUtils';

interface InfoWindowHandlerProps {
  truck: FoodTruck;
  isHovered?: boolean;
}

const InfoWindowHandler = ({ truck, isHovered }: InfoWindowHandlerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Update content when truck or hover state changes
    const content = contentRef.current;
    const isOpen = truck.operatingHours ? checkIsOpen(truck.operatingHours) : false;
    
    // Add appropriate classes for hover effects
    if (isHovered) {
      content.classList.add('hovered');
    } else {
      content.classList.remove('hovered');
    }
  }, [truck, isHovered]);

  // Format price level
  const getPriceLevel = (level: number = 2) => {
    return "$".repeat(level);
  };

  return (
    <div ref={contentRef} className="info-window-content p-2">
      <div className="flex flex-col">
        <h3 className="font-bold text-lg">{truck.name}</h3>
        <div className="text-sm mb-1">{truck.name}</div>
        <div className="flex items-center text-sm mb-2">
          <span className="text-yellow-500 mr-1">★</span>
          <span>{truck.rating ?? '4.5'}</span>
          <span className="mx-2">•</span>
          <span>{getPriceLevel()}</span>
        </div>
        <div className="text-sm text-gray-600">
          {truck.location?.address || 'Address information not available'}
        </div>
        <div className="mt-3 text-xs text-green-600 font-semibold">
          {truck.operatingHours && checkIsOpen(truck.operatingHours) ? 'OPEN NOW' : 'CLOSED'}
        </div>
        <div className="mt-2">
          <button 
            id={`view-truck-${truck.id}`} 
            className="bg-food-coral text-white text-sm py-1 px-3 rounded hover:bg-food-coral/90 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoWindowHandler;
