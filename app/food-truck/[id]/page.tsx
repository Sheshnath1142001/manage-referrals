import { foodTrucks } from "@/data/foodTrucks";
import FoodTruckContent from "./FoodTruckContent";

export function generateStaticParams() {
  return foodTrucks.map((truck) => ({
    id: truck.id,
  }));
}

export default function FoodTruckPage({ params }: { params: { id: string } }) {
  const truck = foodTrucks.find((t) => t.id === params.id);
  
  if (!truck) {
    return null; // This will trigger the not-found page
  }

  return <FoodTruckContent truck={truck} />;
}