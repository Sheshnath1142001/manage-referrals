"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
          alt="Food Truck Festival"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
          Discover Amazing Food Trucks
        </h1>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Find the best food trucks in your area, explore their menus, and enjoy unique culinary experiences on the go.
        </p>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by cuisine, food item, or location..."
                className="pl-10 h-12 bg-white/95 border-0 focus-visible:ring-2 focus-visible:ring-[#C55D5D]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 px-6 bg-[#C55D5D] hover:bg-[#b34d4d] text-white"
            >
              Find Food Trucks
            </Button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
            Popular in Sydney
          </Button>
          <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
            BBQ Trucks
          </Button>
          <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
            Mexican Food
          </Button>
          <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
            Near CBD
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;