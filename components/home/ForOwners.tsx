import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Increase your food truck's visibility",
  "Connect with more customers in your area",
  "Manage your menu and profile easily",
  "Receive and respond to customer reviews",
  "Track your business performance with analytics",
  "Flexible subscription plans for your needs",
];

const ForOwners = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Own a Food Truck?</h2>
            <p className="text-gray-600 mb-6">
              Join LocalFoodTruck.au and reach thousands of hungry customers. Manage your food truck profile, menu, and location updates all in one place.
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="shrink-0 mr-2">
                    <Check className="h-5 w-5 text-[#C55D5D]" />
                  </div>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/owner/register">
                <Button className="bg-[#C55D5D] hover:bg-[#b34d4d] text-white">
                  Register Your Food Truck
                </Button>
              </Link>
              <Link href="/owner/pricing">
                <Button variant="outline" className="border-[#C55D5D] text-[#C55D5D]">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://images.pexels.com/photos/1264937/pexels-photo-1264937.jpeg"
              alt="Food Truck Business"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForOwners;