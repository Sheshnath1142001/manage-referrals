
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

const OwnerCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-food-green text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 font-viga">Own a food truck?</h2>
            <p className="text-lg mb-6">
              Join our platform to reach more customers, manage your profile, and grow your business.
            </p>
            <Button 
              onClick={() => navigate('/owner-dashboard')}
              variant="secondary"
              className="bg-food-coral text-white hover:bg-food-coral/90"
            >
              <Truck className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </div>
          
          <div className="md:w-2/5">
            <img 
              src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Food truck owner" 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCTA;
