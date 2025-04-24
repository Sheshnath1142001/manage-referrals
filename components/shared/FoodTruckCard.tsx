"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodTruck } from "@/types";

interface FoodTruckCardProps {
  truck: FoodTruck;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

const FoodTruckCard = ({
  truck,
  isSaved = false,
  onToggleSave,
}: FoodTruckCardProps) => {
  const [saved, setSaved] = useState(isSaved);

  const handleSaveClick = () => {
    setSaved(!saved);
    if (onToggleSave) {
      onToggleSave(truck.id);
    }
  };

  // Get today's opening hours
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayHours = truck.openingHours.find((day) => day.day === today)?.hours || "Closed";

  return (
    <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="relative h-48">
        <Image
          src={truck.image}
          alt={truck.name}
          fill
          className="object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 bg-white/80 hover:bg-white"
          onClick={handleSaveClick}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Heart
            className={`h-5 w-5 ${saved ? "fill-[#C55D5D] text-[#C55D5D]" : "text-gray-600"}`}
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold line-clamp-1">{truck.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
            <span className="text-sm font-medium">{truck.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {truck.cuisine.map((type) => (
            <Badge key={type} variant="secondary" className="rounded-full">
              {type}
            </Badge>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-3 line-clamp-2">
          {truck.description}
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{truck.location.address}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>Today: {todayHours}</span>
        </div>

        <Link href={`/food-truck/${truck.id}`}>
          <Button className="w-full bg-[#C55D5D] hover:bg-[#b34d4d] gap-2">
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FoodTruckCard;