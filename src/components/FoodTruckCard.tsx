
import { Link } from "react-router-dom";
import { FoodTruck } from "../data/mockData";
import { Card } from "@/components/ui/card";
import { Star, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FoodTruckCardProps {
  truck: FoodTruck;
}

const FoodTruckCard: React.FC<FoodTruckCardProps> = ({ truck }) => {
  return (
    <Link to={`/food-trucks/${truck.id}`}>
      <Card className="food-truck-card overflow-hidden h-full">
        <div className="relative">
          <img 
            src={truck.image} 
            alt={truck.name} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge variant={truck.isOpen ? "default" : "outline"} className={truck.isOpen ? "bg-food-green hover:bg-food-green/90" : "bg-white/80 text-gray-500"}>
              {truck.isOpen ? "Open Now" : "Closed"}
            </Badge>
          </div>
          {truck.logo && (
            <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
              <img 
                src={truck.logo} 
                alt={`${truck.name} logo`} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        <div className="p-4 pt-8">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold truncate">{truck.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-food-yellow text-food-yellow" />
              <span className="ml-1 text-sm font-medium">{truck.rating}</span>
              <span className="ml-1 text-xs text-gray-500">({truck.reviewCount})</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{truck.cuisineType}</p>
          
          <div className="mt-3 flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <p className="text-xs text-gray-500 flex-1">
              {truck.location.address || "Location varies"}
              {truck.distance && <span className="ml-1">• {truck.distance} km away</span>}
            </p>
          </div>
          
          <div className="mt-2 flex items-start space-x-2">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <p className="text-xs text-gray-500">
              {truck.isOpen 
                ? `Open today: ${truck.openHours[new Date().toLocaleDateString('en-US', { weekday: 'long' })]}`
                : `Opens: ${truck.openHours[Object.keys(truck.openHours).find(day => truck.openHours[day] !== "Closed") || "Monday"]}`
              }
            </p>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {truck.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {truck.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{truck.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default FoodTruckCard;
