
import { Search, UtensilsCrossed, Star } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-food-green font-viga">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-food-green bg-opacity-10 flex items-center justify-center mb-4">
              <Search className="text-food-green" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-food-blue font-viga">Find</h3>
            <p className="text-gray-600">Search for food trucks by cuisine, menu items, or your current location.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-food-coral bg-opacity-10 flex items-center justify-center mb-4">
              <UtensilsCrossed className="text-food-coral" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-food-blue font-viga">Explore</h3>
            <p className="text-gray-600">Browse menus, check locations, and read customer reviews.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-food-blue bg-opacity-10 flex items-center justify-center mb-4">
              <Star className="text-food-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-food-blue font-viga">Enjoy</h3>
            <p className="text-gray-600">Visit your chosen food truck and share your experience with our community.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
