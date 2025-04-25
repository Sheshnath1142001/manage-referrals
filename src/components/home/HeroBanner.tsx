
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

const HeroBanner = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { location } = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&lat=${location?.latitude || ''}&lng=${location?.longitude || ''}`);
    }
  };

  return (
    <section className="relative h-[500px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
          alt="Food trucks" 
          className="w-full h-full object-cover brightness-[0.4]"
        />
      </div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
        <p className="text-lg md:text-xl text-center mb-8 max-w-2xl">
          Discover delicious food trucks near you, right at your fingertips.
        </p>
        
        <form onSubmit={handleSearch} className="w-full max-w-md relative">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for cuisine, food trucks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-6 rounded-lg text-black focus:ring-2 focus:ring-food-green focus:ring-opacity-50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          </div>
          <Button type="submit" className="absolute right-1 top-1 bg-food-coral hover:bg-food-coral/90">
            Search
          </Button>
        </form>
        
        <h1 className="text-4xl md:text-6xl font-bold mt-10 text-center tracking-wider font-viga">
          STREET FOOD, YOUR WAY
        </h1>
      </div>
    </section>
  );
};

export default HeroBanner;
