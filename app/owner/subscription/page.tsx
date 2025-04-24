"use client";

import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptions } from "@/data/analytics";

export default function SubscriptionPage() {
  // For demo, we'll use the first owner's subscription
  const currentPlan = subscriptions["o1"];
  const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Premium">(currentPlan.name);

  const handlePlanChange = () => {
    // In a real app, this would initiate a payment/subscription change flow
    alert(`Subscription changed to ${selectedPlan} plan!`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-gray-600 mb-8">
              Choose the plan that works best for your food truck business
            </p>

            <div className="mb-8 bg-white rounded-lg border p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-[#C55D5D] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Current Plan: {currentPlan.name}</h3>
                <p className="text-sm text-gray-600">
                  You are currently billed ${currentPlan.price} per month. Your next billing date is June 15, 2025.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className={`border-2 ${selectedPlan === "Basic" ? "border-[#C55D5D]" : "border-transparent"}`}>
                <CardHeader>
                  <CardTitle>Basic Plan</CardTitle>
                  <CardDescription>Perfect for new food trucks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Standard listing</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Simple menu management</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Customer reviews</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={currentPlan.name === "Basic" ? "outline" : "default"}
                    className={`w-full ${
                      currentPlan.name === "Basic"
                        ? "border-[#C55D5D] text-[#C55D5D]"
                        : "bg-[#C55D5D] hover:bg-[#b34d4d]"
                    }`}
                    onClick={() => setSelectedPlan("Basic")}
                    disabled={currentPlan.name === "Basic"}
                  >
                    {currentPlan.name === "Basic" ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className={`border-2 ${selectedPlan === "Premium" ? "border-[#C55D5D]" : "border-transparent"}`}>
                <CardHeader>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>For established food trucks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$29.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>
                        <strong>Featured</strong> listing
                      </span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Menu customization</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Customer messaging</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Social media integration</span>
                    </li>
                    <li className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={currentPlan.name === "Premium" ? "outline" : "default"}
                    className={`w-full ${
                      currentPlan.name === "Premium"
                        ? "border-[#C55D5D] text-[#C55D5D]"
                        : "bg-[#C55D5D] hover:bg-[#b34d4d]"
                    }`}
                    onClick={() => setSelectedPlan("Premium")}
                    disabled={currentPlan.name === "Premium"}
                  >
                    {currentPlan.name === "Premium" ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {selectedPlan !== currentPlan.name && (
              <div className="text-center">
                <Button 
                  className="bg-[#C55D5D] hover:bg-[#b34d4d]"
                  onClick={handlePlanChange}
                >
                  {currentPlan.name === "Basic" ? "Upgrade to Premium" : "Downgrade to Basic"}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {currentPlan.name === "Basic"
                    ? "You'll be charged the price difference immediately"
                    : "Your new plan will take effect at the end of your current billing cycle"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}