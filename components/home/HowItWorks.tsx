import { Search, Utensils, Star, TruckIcon } from "lucide-react";

const steps = [
  {
    icon: <Search className="h-8 w-8 text-[#C55D5D]" />,
    title: "Find Food Trucks",
    description: "Search for food trucks by cuisine, location, or menu items. Filter by ratings and distance.",
  },
  {
    icon: <TruckIcon className="h-8 w-8 text-[#C55D5D]" />,
    title: "View Details",
    description: "Check out menus, opening hours, locations, and customer reviews for each food truck.",
  },
  {
    icon: <Utensils className="h-8 w-8 text-[#C55D5D]" />,
    title: "Enjoy Great Food",
    description: "Visit the food truck and enjoy delicious meals prepared by passionate chefs.",
  },
  {
    icon: <Star className="h-8 w-8 text-[#C55D5D]" />,
    title: "Leave Reviews",
    description: "Share your experience with the community by rating and reviewing the food trucks.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-[#F3F4F6]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            LocalFoodTruck.au makes it easy to discover and enjoy the best food trucks across Australia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#C55D5D]/10 mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;