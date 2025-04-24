import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#F3F4F6] pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">LocalFoodTruck.au</h3>
            <p className="text-gray-600 mb-4">
              Connecting food lovers with the best food trucks across Australia.
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-gray-600 hover:text-[#C55D5D]" />
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-gray-600 hover:text-[#C55D5D]" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5 text-gray-600 hover:text-[#C55D5D]" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#C55D5D]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-[#C55D5D]">
                  Find Food Trucks
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-[#C55D5D]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#C55D5D]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">For Food Truck Owners</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/owner/register" className="text-gray-600 hover:text-[#C55D5D]">
                  Register Your Truck
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="text-gray-600 hover:text-[#C55D5D]">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/pricing" className="text-gray-600 hover:text-[#C55D5D]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/owner/resources" className="text-gray-600 hover:text-[#C55D5D]">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-600" />
                <a href="mailto:info@localfoodtruck.au" className="text-gray-600 hover:text-[#C55D5D]">
                  info@localfoodtruck.au
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-600" />
                <a href="tel:+61-2-1234-5678" className="text-gray-600 hover:text-[#C55D5D]">
                  +61 2 1234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} LocalFoodTruck.au. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-600 hover:text-[#C55D5D] text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-[#C55D5D] text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-[#C55D5D] text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;