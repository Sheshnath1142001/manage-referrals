"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const cuisineOptions = [
  "Australian",
  "BBQ",
  "Mexican",
  "Italian",
  "Asian",
  "Indian",
  "Greek",
  "Middle Eastern",
  "Vegan",
  "Desserts",
  "Coffee",
];

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className }: SearchBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [distance, setDistance] = useState([5]);
  
  // Mock suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      // This would come from API in real implementation
      const mockSuggestions = [
        `${query} food trucks`,
        `Best ${query} in Sydney`,
        `${query} near me`,
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = () => {
    // Build search parameters
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCuisines.length) params.set("cuisines", selectedCuisines.join(","));
    if (distance[0] !== 5) params.set("distance", distance[0].toString());
    
    // Navigate to search results page with filters
    router.push(`/search?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleClear = () => {
    setQuery("");
    setSelectedCuisines([]);
    setDistance([5]);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex rounded-lg overflow-hidden shadow-sm border">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search for food trucks, cuisine or location..."
            className="border-0 h-12 pl-12 pr-4 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          {query && (
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-12 px-4 border-l bg-white hover:bg-gray-100">
              <Filter className="h-5 w-5 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Cuisine</h4>
                <div className="grid grid-cols-2 gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={selectedCuisines.includes(cuisine)}
                        onCheckedChange={() => handleCuisineChange(cuisine)}
                      />
                      <Label htmlFor={cuisine} className="text-sm">
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Distance</h4>
                  <span className="text-sm">{distance[0]} km</span>
                </div>
                <Slider
                  value={distance}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={setDistance}
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                >
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#C55D5D] hover:bg-[#b34d4d]"
                  onClick={handleSearch}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          className="h-12 px-6 bg-[#C55D5D] hover:bg-[#b34d4d] rounded-none"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Command className="absolute top-full left-0 w-full mt-1 rounded-lg border shadow-md z-10">
          <CommandList>
            {suggestions.map((suggestion, i) => (
              <CommandItem
                key={i}
                onSelect={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                  handleSearch();
                }}
                className="cursor-pointer"
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                {suggestion}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )}
    </div>
  );
};

export default SearchBar;