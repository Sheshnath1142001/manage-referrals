"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  MapPin, 
  Clock, 
  Heart, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ReviewCard from "@/components/shared/ReviewCard";
import { FoodTruck, MenuItem } from "@/types";

interface FoodTruckContentProps {
  truck: FoodTruck;
}

export default function FoodTruckContent({ truck }: FoodTruckContentProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Group menu items by category
  const menuByCategory = truck.menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert("Please select a rating before submitting your review.");
      return;
    }
    
    // In a real app, this would send the review to an API
    alert("Thank you for your review!");
    setRating(0);
    setReviewText("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-1">
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={truck.image}
            alt={truck.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {truck.cuisine.map((type) => (
                      <Badge key={type} variant="secondary" className="bg-white/20">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{truck.name}</h1>
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{truck.rating.toFixed(1)}</span>
                      <span className="text-white/70 ml-1">
                        ({truck.reviews.length} reviews)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{truck.location.address}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/10 border-white/20 hover:bg-white/20"
                  onClick={handleSaveClick}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isSaved ? "fill-[#C55D5D] text-[#C55D5D]" : "text-white"
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs
            defaultValue="menu"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Menu</CardTitle>
                      <CardDescription>
                        Explore our delicious offerings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(menuByCategory).map((category) => (
                        <div key={category} className="mb-6">
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleCategory(category)}
                          >
                            <h3 className="text-lg font-semibold">{category}</h3>
                            {expandedCategories.includes(category) ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                          
                          {expandedCategories.includes(category) && (
                            <div className="mt-3 space-y-4">
                              {menuByCategory[category].map((item) => (
                                <div
                                  key={item.id}
                                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="flex items-center">
                                        <h4 className="font-medium">{item.name}</h4>
                                        {item.popular && (
                                          <Badge
                                            variant="outline"
                                            className="ml-2 border-[#C55D5D] text-[#C55D5D] text-xs"
                                          >
                                            Popular
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {item.description}
                                      </p>
                                      {item.dietary && item.dietary.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                          {item.dietary.map((diet) => (
                                            <Badge
                                              key={diet}
                                              variant="secondary"
                                              className="text-xs bg-gray-100"
                                            >
                                              {diet}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium">
                                      ${item.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="sticky top-20">
                    <CardHeader>
                      <CardTitle>Opening Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {truck.openingHours.map((day) => {
                          const isToday = 
                            new Date().toLocaleDateString("en-US", { weekday: "long" }) === day.day;
                          
                          return (
                            <div
                              key={day.day}
                              className={`flex justify-between items-center py-1 ${
                                isToday ? "font-semibold" : ""
                              }`}
                            >
                              <span>{day.day}{isToday && " (Today)"}</span>
                              <span>{day.hours}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-gray-500">
                        <Clock className="h-4 w-4 inline-block mr-1" />
                        Hours may vary during holidays
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {truck.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{truck.description}</p>

                      <Accordion type="single" collapsible className="mt-4">
                        <AccordionItem value="location">
                          <AccordionTrigger>Location</AccordionTrigger>
                          <AccordionContent>
                            <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-md">
                              <div className="text-center p-6">
                                <MapPin className="h-8 w-8 text-[#C55D5D] mx-auto mb-2" />
                                <p className="font-medium mb-1">{truck.location.address}</p>
                                <p className="text-sm text-gray-500">
                                  Map will be displayed here in the full app
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <a href={`tel:${truck.contact.phone}`} className="text-[#C55D5D]">
                            {truck.contact.phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium">Email</p>
                          <a href={`mailto:${truck.contact.email}`} className="text-[#C55D5D]">
                            {truck.contact.email}
                          </a>
                        </div>
                      </div>

                      {truck.contact.website && (
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a
                              href={`https://${truck.contact.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C55D5D]"
                            >
                              {truck.contact.website}
                            </a>
                          </div>
                        </div>
                      )}

                      {truck.contact.social && (
                        <div className="pt-2 border-t">
                          <p className="font-medium mb-2">Social Media</p>
                          <div className="flex space-x-3">
                            {truck.contact.social.facebook && (
                              <a
                                href={`https://${truck.contact.social.facebook}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-[#C55D5D]"
                              >
                                <Facebook className="h-5 w-5" />
                              </a>
                            )}
                            {truck.contact.social.instagram && (
                              <a
                                href={`https://${truck.contact.social.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-[#C55D5D]"
                              >
                                <Instagram className="h-5 w-5" />
                              </a>
                            )}
                            {truck.contact.social.twitter && (
                              <a
                                href={`https://${truck.contact.social.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-[#C55D5D]"
                              >
                                <Twitter className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Ratings</CardTitle>
                  <CardDescription>
                    {truck.reviews.length} reviews, {truck.rating.toFixed(1)} average rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
                    <div className="flex items-center mb-4">
                      <p className="mr-2">Your Rating:</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Write your review here..."
                      className="mb-3"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <Button 
                      className="bg-[#C55D5D] hover:bg-[#b34d4d]" 
                      onClick={handleSubmitReview}
                    >
                      Submit Review
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {truck.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}