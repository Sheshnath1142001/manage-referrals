import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, MapPin } from "lucide-react";
import { useLocation } from "../hooks/useLocation";
import { useIsMobile } from "../hooks/use-mobile";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { location, locationName } = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&lat=${location?.latitude || ''}&lng=${location?.longitude || ''}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/c45e3641-a6cb-4ed8-8210-991b7bff6729.png" 
              alt="Local Food Truck" 
              className="h-12 w-auto"
            />
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                type="text"
                placeholder="Search for cuisine, food trucks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={16} className="mr-1 text-food-coral" />
              <span className="truncate max-w-[120px]">{locationName || "Detecting location..."}</span>
            </div>
            <Link to="/search">
              <Button variant="ghost" className="text-food-blue hover:text-food-blue/80 hover:bg-food-blue/10">Explore</Button>
            </Link>
            <Link to="/owner-dashboard">
              <Button variant="outline" className="border-food-green text-food-green hover:bg-food-green/10">Food Truck Owner?</Button>
            </Link>
            <Link to="/signin">
              <Button className="bg-food-coral hover:bg-food-coral/90 text-white">Sign In</Button>
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} className="text-food-blue" /> : <Menu size={24} className="text-food-blue" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4 flex flex-col">
            <form onSubmit={handleSearch} className="relative mb-6">
              <Input
                type="text"
                placeholder="Search for cuisine, food trucks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </form>
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <MapPin size={16} className="mr-1 text-food-coral" />
              <span className="truncate">{locationName || "Detecting location..."}</span>
            </div>
            <div className="flex flex-col space-y-4">
              <Link to="/search" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-food-blue hover:text-food-blue/80 hover:bg-food-blue/10">Explore</Button>
              </Link>
              <Link to="/owner-dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start border-food-green text-food-green hover:bg-food-green/10">Food Truck Owner?</Button>
              </Link>
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full justify-start bg-food-coral hover:bg-food-coral/90 text-white">Sign In</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
