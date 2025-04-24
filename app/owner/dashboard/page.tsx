"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layout, 
  Menu, 
  User, 
  Map, 
  BarChart4, 
  LogOut,
  Star
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProfileManager from "@/components/owner/ProfileManager";
import MenuManager from "@/components/owner/MenuManager";
import LocationManager from "@/components/owner/LocationManager";
import AnalyticsDashboard from "@/components/owner/AnalyticsDashboard";
import ReviewCard from "@/components/shared/ReviewCard";
import { foodTrucks } from "@/data/foodTrucks";
import { ownerAnalytics, subscriptions } from "@/data/analytics";

export default function OwnerDashboardPage() {
  // For demo purposes, we'll use the first food truck
  const ownerId = "o1";
  const truck = foodTrucks.find(t => t.owner === ownerId)!;
  
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Owner Dashboard</h1>
              <p className="text-gray-600">
                Manage your food truck profile, menu, and more
              </p>
            </div>
            <div>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 -mr-4"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3 lg:col-span-2">
              <div className="space-y-1">
                <Button
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  className={activeTab === "analytics" ? "w-full bg-[#C55D5D] hover:bg-[#b34d4d] justify-start" : "w-full justify-start"}
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className={activeTab === "profile" ? "w-full bg-[#C55D5D] hover:bg-[#b34d4d] justify-start" : "w-full justify-start"}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "menu" ? "default" : "ghost"}
                  className={activeTab === "menu" ? "w-full bg-[#C55D5D] hover:bg-[#b34d4d] justify-start" : "w-full justify-start"}
                  onClick={() => setActiveTab("menu")}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
                <Button
                  variant={activeTab === "location" ? "default" : "ghost"}
                  className={activeTab === "location" ? "w-full bg-[#C55D5D] hover:bg-[#b34d4d] justify-start" : "w-full justify-start"}
                  onClick={() => setActiveTab("location")}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Location
                </Button>
                <Button
                  variant={activeTab === "reviews" ? "default" : "ghost"}
                  className={activeTab === "reviews" ? "w-full bg-[#C55D5D] hover:bg-[#b34d4d] justify-start" : "w-full justify-start"}
                  onClick={() => setActiveTab("reviews")}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Reviews
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm font-medium mb-1">Current Plan</div>
                <div className="text-lg font-bold mb-2">{subscriptions[ownerId].name}</div>
                <div className="text-sm text-gray-600 mb-4">
                  ${subscriptions[ownerId].price}/month
                </div>
                <Link href="/owner/subscription">
                  <Button variant="outline" size="sm" className="w-full border-[#C55D5D] text-[#C55D5D]">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:col-span-9 lg:col-span-10">
              {activeTab === "analytics" && (
                <AnalyticsDashboard analytics={ownerAnalytics[ownerId]} truck={truck} />
              )}
              {activeTab === "profile" && (
                <ProfileManager initialData={truck} />
              )}
              {activeTab === "menu" && (
                <MenuManager initialMenuItems={truck.menu} />
              )}
              {activeTab === "location" && (
                <LocationManager truck={truck} />
              )}
              {activeTab === "reviews" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Reviews & Feedback</h2>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Average Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 font-bold">{truck.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {truck.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} isOwner={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}