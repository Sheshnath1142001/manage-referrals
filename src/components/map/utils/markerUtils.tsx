
import { FoodTruck } from '@/lib/foodTruckService';
import { checkIsOpen, calculateDistance } from './mapUtils';

interface CreateUserMarkerProps {
  map: google.maps.Map;
  position: { lat: number; lng: number };
}

export const createUserMarker = ({ map, position }: CreateUserMarkerProps): {
  marker: google.maps.Marker;
  circle: google.maps.Circle;
} => {
  // Add user location marker with blue dot
  const userMarker = new google.maps.Marker({
    position,
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
    title: "Your Location",
    zIndex: 1000,
  });

  // Create an animated circle around user location
  const userCircle = new google.maps.Circle({
    strokeColor: "#4285F4",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#4285F4",
    fillOpacity: 0.35,
    map,
    center: position,
    radius: 50,
    zIndex: 999,
  });

  return { marker: userMarker, circle: userCircle };
};

interface CreateFoodTruckMarkerProps {
  map: google.maps.Map;
  truck: FoodTruck & { location: { latitude: number; longitude: number } };
  onMarkerClick: (marker: google.maps.Marker, truck: FoodTruck) => void;
}

export const createFoodTruckMarker = ({ 
  map, 
  truck, 
  onMarkerClick 
}: CreateFoodTruckMarkerProps): google.maps.Marker | null => {
  try {
    if (!truck.location?.latitude || !truck.location?.longitude) return null;

    const marker = new google.maps.Marker({
      position: {
        lat: truck.location.latitude,
        lng: truck.location.longitude
      },
      map,
      title: truck.name,
      icon: {
        url: "/foodtruck-icon.svg", // Custom SVG icon
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40),
      },
      animation: google.maps.Animation.DROP,
    });

    // Add click handler to marker
    marker.addListener("click", () => onMarkerClick(marker, truck));

    return marker;
  } catch (err) {
    console.error(`Error creating marker for truck ${truck.id}:`, err);
    return null;
  }
};

export const createInfoWindowContent = (
  truck: FoodTruck, 
  distance: number | null, 
  isOpen: boolean,
  truckId: string
): string => {
  return `
    <div style="width: 200px; font-family: Arial, sans-serif;">
      <h3 style="margin: 0; padding: 5px 0; color: #2A9D8F; font-weight: bold;">${truck.name}</h3>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <span style="margin-right: 10px;">⭐ ${truck.averageRating?.toFixed(1) || 'New'}</span>
        <span>${truck.cuisineType}</span>
      </div>
      ${distance ? `<p style="margin: 5px 0">${distance.toFixed(1)} mi away</p>` : ''}
      <p style="margin: 5px 0; color: ${isOpen ? 'green' : 'red'}">${isOpen ? '🟢 Open now' : '🔴 Closed'}</p>
      <button
        style="margin-top: 5px; padding: 5px 10px; background-color: #2A9D8F; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;"
        id="view-truck-${truckId}"
      >
        View Details
      </button>
    </div>
  `;
};
