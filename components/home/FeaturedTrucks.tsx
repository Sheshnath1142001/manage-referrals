import Link from "next/link";
import { ChevronRight } from "lucide-react";
import FoodTruckCard from "@/components/shared/FoodTruckCard";
import { Button } from "@/components/ui/button";
import { foodTrucks } from "@/data/foodTrucks";

const FeaturedTrucks = () => {
  // For featured section, we just use the existing food trucks
  // In a real app, this would filter based on featured status or rating
  const featuredTrucks = foodTrucks.slice(0, 3);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Food Trucks</h2>
            <p className="text-gray-500 mt-2">Discover the most popular food trucks in Australia</p>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="text-[#C55D5D] hover:text-[#b34d4d] flex items-center gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTrucks.map((truck) => (
            <FoodTruckCard key={truck.id} truck={truck} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/search">
            <Button className="bg-[#C55D5D] hover:bg-[#b34d4d]">
              Explore All Food Trucks
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrucks;