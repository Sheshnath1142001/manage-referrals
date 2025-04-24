"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/shared/SearchBar";
import FoodTruckCard from "@/components/shared/FoodTruckCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FoodTruck } from "@/types";
import { foodTrucks } from "@/data/foodTrucks";

export default function SearchPage() {
  const searchParams = useSearchParams();

  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const cuisineFilter = useMemo(
    () => searchParams.get("cuisines")?.split(",") || [],
    [searchParams]
  );
  const distanceFilter = useMemo(
    () =>
      searchParams.get("distance") ? parseInt(searchParams.get("distance")!) : 5,
    [searchParams]
  );

  const [results, setResults] = useState<FoodTruck[]>([]);
  const [savedTruckIds, setSavedTruckIds] = useState<string[]>([]);

  useEffect(() => {
    let filtered = [...foodTrucks];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (truck) =>
          truck.name.toLowerCase().includes(lowerQuery) ||
          truck.cuisine.some((c) => c.toLowerCase().includes(lowerQuery)) ||
          truck.description.toLowerCase().includes(lowerQuery) ||
          truck.location.address.toLowerCase().includes(lowerQuery) ||
          truck.menu.some(
            (item) =>
              item.name.toLowerCase().includes(lowerQuery) ||
              item.description.toLowerCase().includes(lowerQuery)
          )
      );
    }

    if (cuisineFilter.length > 0) {
      filtered = filtered.filter((truck) =>
        truck.cuisine.some((c) => cuisineFilter.includes(c))
      );
    }

    setResults(filtered);
  }, [query, cuisineFilter, distanceFilter]);

  const handleToggleSave = (id: string) => {
    setSavedTruckIds((prev) =>
      prev.includes(id) ? prev.filter((truckId) => truckId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Find Food Trucks</h1>

          <SearchBar className="mb-8" />

          {query || cuisineFilter.length > 0 ? (
            <div className="mb-6">
              <p className="text-lg font-medium">
                {results.length} results found
                {query ? ` for "${query}"` : ""}
                {cuisineFilter.length ? ` in ${cuisineFilter.join(", ")}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                Showing food trucks within {distanceFilter} km
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-lg font-medium">All Food Trucks</p>
              <p className="text-sm text-gray-500">
                Browse all available food trucks in your area
              </p>
            </div>
          )}

          <Separator className="mb-6" />

          {results.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">No Results Found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find food trucks.
              </p>
              <Button
                onClick={() => {
                  window.location.href = "/search";
                }}
                className="bg-[#C55D5D] hover:bg-[#b34d4d]"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((truck) => (
                <FoodTruckCard
                  key={truck.id}
                  truck={truck}
                  isSaved={savedTruckIds.includes(truck.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
