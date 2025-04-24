import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTrucks from "@/components/home/FeaturedTrucks";
import HowItWorks from "@/components/home/HowItWorks";
import ForOwners from "@/components/home/ForOwners";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedTrucks />
        <HowItWorks />
        <ForOwners />
        
        <section className="py-16 bg-[#C55D5D] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Food Adventure?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover amazing food trucks across Australia and support local businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button className="bg-white text-[#C55D5D] hover:bg-gray-100">
                  Find Food Trucks
                </Button>
              </Link>
              <Link href="/owner/register">
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  Register Your Truck
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}