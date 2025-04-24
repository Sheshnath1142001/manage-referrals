"use client";

import { useState } from "react";
import { MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FoodTruck } from "@/types";

interface LocationManagerProps {
  truck: FoodTruck;
}

const popularLocations = [
  "Sydney CBD",
  "Bondi Beach",
  "Darling Harbour",
  "Circular Quay",
  "Surry Hills",
  "Newtown",
  "Parramatta",
  "Manly",
  "Eastern Suburbs",
  "Northern Beaches",
];

const LocationManager = ({ truck }: LocationManagerProps) => {
  const [location, setLocation] = useState(truck.location.address);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveLocation = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Location updated successfully!");
    }, 1000);
  };

  const handleQuickSelect = (selectedLocation: string) => {
    setLocation(selectedLocation + ", Sydney");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Location Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Update Your Location</CardTitle>
              <CardDescription>
                Let your customers know where to find you. Update your location whenever you move.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Enter your current location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveLocation} 
                  disabled={isLoading || !location}
                  className="bg-[#C55D5D] hover:bg-[#b34d4d]"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </span>
                  )}
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Quick Select</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularLocations.map((loc) => (
                    <Button
                      key={loc}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect(loc)}
                      className="text-xs"
                    >
                      {loc}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Schedule</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Day
                    </label>
                    <Select defaultValue="today">
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="upcoming">Next 7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Hours
                    </label>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="10am">
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(13)].map((_, i) => (
                            <SelectItem
                              key={i}
                              value={`${i + 6}${i + 6 < 12 ? "am" : "pm"}`}
                            >
                              {i + 6}:00 {i + 6 < 12 ? "AM" : "PM"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>to</span>
                      <Select defaultValue="6pm">
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(13)].map((_, i) => (
                            <SelectItem
                              key={i}
                              value={`${i + 12 > 12 ? i : i + 12}${
                                i < 1 ? "pm" : "pm"
                              }`}
                            >
                              {i + 12 > 12 ? i : i + 12}:00 PM
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Location Preview</CardTitle>
              <CardDescription>
                This is how your location will appear to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center border">
                <div className="text-center p-4">
                  <MapPin className="h-10 w-10 text-[#C55D5D] mx-auto mb-2" />
                  <p className="font-medium">{location || "No location set"}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Map will be displayed here in the customer view
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Note: In the full version, this will display an interactive map
                with your exact location.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationManager;