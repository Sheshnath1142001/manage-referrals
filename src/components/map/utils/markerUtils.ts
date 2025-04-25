
import { FoodTruck } from "@/lib/types";

// Helper function to create info window content
export const createInfoWindowContent = (truck: FoodTruck) => {
  const isOpen = truck.operatingHours ? checkIsOpen(truck.operatingHours) : false;
  
  return `
    <div class="info-window-content">
      <h3 class="font-bold text-lg">${truck.name}</h3>
      <div class="text-sm mb-1">${truck.name}</div>
      <div class="flex items-center text-sm mb-2">
        <span class="text-yellow-500 mr-1">★</span>
        <span>${truck.rating ?? '4.5'}</span>
        <span class="mx-2">•</span>
        <span>${getPriceLevel()}</span>
      </div>
      <div class="text-sm text-gray-600">
        ${truck.location?.address || 'Address information not available'}
      </div>
      <div class="mt-3 text-xs ${isOpen ? 'text-green-600' : 'text-red-600'} font-semibold">
        ${isOpen ? 'OPEN NOW' : 'CLOSED'}
      </div>
      <div class="mt-2">
        <button 
          id="view-truck-${truck.id}" 
          class="bg-food-coral text-white text-sm py-1 px-3 rounded hover:bg-food-coral/90 transition"
        >
          View Details
        </button>
      </div>
    </div>
  `;
};

// Helper function to format price level
const getPriceLevel = (level: number = 2) => {
  return "$".repeat(level);
};

// Helper function to check if a food truck is currently open
export const checkIsOpen = (operatingHours: any) => {
  if (!operatingHours) return false;
  
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const todayHours = operatingHours[day];
  if (!todayHours || todayHours.isClosed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};
