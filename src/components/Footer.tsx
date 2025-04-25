
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/lovable-uploads/c45e3641-a6cb-4ed8-8210-991b7bff6729.png" 
                alt="Local Food Truck" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Connecting hungry Aussies with the best food trucks across Australia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-food-orange">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-food-orange">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-food-orange">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/search" className="hover:text-food-orange">Find Food Trucks</Link></li>
              <li><Link to="/" className="hover:text-food-orange">How It Works</Link></li>
              <li><Link to="/" className="hover:text-food-orange">FAQ</Link></li>
              <li><Link to="/" className="hover:text-food-orange">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4">For Food Truck Owners</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/owner-dashboard" className="hover:text-food-orange">Join Us</Link></li>
              <li><Link to="/" className="hover:text-food-orange">Benefits</Link></li>
              <li><Link to="/" className="hover:text-food-orange">Success Stories</Link></li>
              <li><Link to="/" className="hover:text-food-orange">Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-food-orange">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-food-orange">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-food-orange">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} localfoodtruck.au. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
