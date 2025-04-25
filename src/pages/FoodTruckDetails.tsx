import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  Globe,
  Share,
  Instagram,
  Utensils,
  ChevronLeft,
  Heart,
  Calendar,
  Facebook,
  Twitter,
  Menu as MenuIcon,
  MessageCircle,
  Info,
  User,
  Award,
  Tag,
  Check,
  Image as ImageIcon,
  MapPinOff,
  FileText,
  X
} from "lucide-react";
import { getFoodTruckById } from "@/lib/foodTruckService";
import { getFeedback } from "@/lib/feedbackService";
import { getMenuItems, getMenuCategories } from "@/lib/menuService";
import { getLocations } from "@/lib/locationService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";

const FoodTruckDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedToFavorites, setSavedToFavorites] = useState(false);

  const {
    data: truckData,
    isLoading: truckLoading,
    error: truckError,
  } = useQuery({
    queryKey: ["foodTruck", id],
    queryFn: () => (id ? getFoodTruckById(id) : Promise.reject("No ID provided")),
    enabled: !!id,
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => (id ? getFeedback(id) : Promise.reject("No ID provided")),
    enabled: !!id,
  });

  const {
    data: menuData,
    isLoading: menuLoading,
  } = useQuery({
    queryKey: ["menu", id],
    queryFn: () => (id ? getMenuItems(id) : Promise.reject("No ID provided")),
    enabled: !!id,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["menuCategories", id],
    queryFn: () => (id ? getMenuCategories(id) : Promise.reject("No ID provided")),
    enabled: !!id,
  });

  const {
    data: locationsData,
    isLoading: locationsLoading,
  } = useQuery({
    queryKey: ["locations", id],
    queryFn: () => (id ? getLocations(id, { isActive: true }) : Promise.reject("No ID provided")),
    enabled: !!id,
  });

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (truckError) {
      toast({
        title: "Error",
        description: "Failed to load food truck details. Please try again.",
        variant: "destructive",
      });
    }
  }, [truckError, toast]);

  const handleSaveToFavorites = () => {
    setSavedToFavorites(!savedToFavorites);
    toast({
      title: savedToFavorites ? "Removed from favorites" : "Added to favorites",
      description: savedToFavorites 
        ? "This food truck has been removed from your favorites" 
        : "This food truck has been added to your favorites",
    });
  };

  if (truckLoading || reviewsLoading || menuLoading || categoriesLoading || locationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-food-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading food truck details...</p>
        </div>
      </div>
    );
  }

  if (!truckData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Food Truck Not Found</h2>
          <p className="mb-6">Sorry, we couldn't find the food truck you're looking for.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOpen = () => {
    if (!truckData.operatingHours) return false;

    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const currentTime = format(now, 'HH:mm');

    const todayHours = truckData.operatingHours[day as keyof typeof truckData.operatingHours];

    if (!todayHours || todayHours.length === 0) return false;

    return todayHours.some(({ open, close }) => {
      return currentTime >= open && currentTime <= close;
    });
  };

  const getMenuItemsByCategory = (category: string) => {
    if (!menuData || !menuData.items) return [];
    return menuData.items.filter(item => item.category === category);
  };

  const getStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FoodEstablishment",
      "name": truckData.name,
      "image": truckData.image,
      "description": truckData.description,
      "url": window.location.href,
      "telephone": truckData.phone,
      "servesCuisine": truckData.cuisineType,
      "priceRange": "$$",
      "address": locationsData && locationsData.items.length > 0 ? {
        "@type": "PostalAddress",
        "streetAddress": locationsData.items[0].address,
        "addressLocality": locationsData.items[0].city,
        "addressRegion": locationsData.items[0].state,
        "postalCode": locationsData.items[0].zipCode,
      } : undefined,
      "aggregateRating": truckData.averageRating ? {
        "@type": "AggregateRating",
        "ratingValue": truckData.averageRating,
        "reviewCount": truckData.totalRatings
      } : undefined,
      "openingHours": truckData.operatingHours ? 
        Object.entries(truckData.operatingHours).map(([day, hours]) => {
          if (!hours || hours.length === 0) return null;
          return hours.map(h => `${day.charAt(0).toUpperCase() + day.slice(1)} ${h.open}-${h.close}`);
        }).filter(Boolean).flat() : 
        undefined
    };
  };

  return (
    <>
      <Helmet>
        <title>{truckData.name} | Local Food Truck Finder</title>
        <meta name="description" content={truckData.description} />
        <meta property="og:title" content={`${truckData.name} | Local Food Truck Finder`} />
        <meta property="og:description" content={truckData.description} />
        <meta property="og:image" content={truckData.image || truckData.bannerImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={truckData.name} />
        <meta name="twitter:description" content={truckData.description} />
        <meta name="twitter:image" content={truckData.image || truckData.bannerImage} />
        <meta name="keywords" content={`food truck, ${truckData.cuisineType}, ${truckData.name}, ${truckData.tags?.map(tag => tag.name).join(', ')}`} />
        <script type="application/ld+json">
          {JSON.stringify(getStructuredData())}
        </script>
      </Helmet>
      
      <div className="min-h-screen pb-12">
        <div className="relative h-[400px] md:h-[500px] w-full">
          <img
            src={truckData.bannerImage || truckData.image || "https://placehold.co/1200x400/e2e8f0/a3a3a3?text=No+Image"}
            alt={truckData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
            <div className="container mx-auto">
              <Link to="/" className="inline-flex items-center text-white mb-4 hover:underline">
                <ChevronLeft size={16} className="mr-1" />
                Back to Home
              </Link>

              <div className="flex items-center mb-2">
                {isOpen() ? (
                  <Badge className="bg-green-500 hover:bg-green-500/90 mr-2">Open Now</Badge>
                ) : (
                  <Badge variant="outline" className="bg-white/80 text-gray-800 mr-2">Closed</Badge>
                )}
                {truckData.tags && truckData.tags.slice(0, 3).map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="mr-2 bg-white/80 text-gray-800">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{truckData.name}</h1>

              <div className="flex items-center text-white mb-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium mr-1">{truckData.averageRating?.toFixed(1) || "New"}</span>
                {truckData.totalRatings > 0 && (
                  <span className="text-white/80">({truckData.totalRatings} reviews)</span>
                )}
              </div>

              <p className="text-white/90 max-w-2xl text-lg">{truckData.description}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-10 md:-mt-16 relative z-10">
          <div className="bg-white rounded-t-lg shadow-lg p-6">
            {truckData.logo && (
              <div className="relative -mt-20 mb-4 inline-block">
                <img 
                  src={truckData.logo} 
                  alt={`${truckData.name} Logo`} 
                  className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
                />
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
                <Utensils className="mr-1 h-3 w-3" />
                <span className="capitalize">{truckData.cuisineType}</span>
              </div>
              
              {locationsData && locationsData.items.length > 0 && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span>{locationsData.items[0].city || "Current Location"}</span>
                </div>
              )}
              
              {truckData.isPremium && (
                <div className="bg-amber-100 px-3 py-1 rounded-full text-sm text-amber-800 flex items-center">
                  <Award className="mr-1 h-3 w-3" />
                  <span>Premium Vendor</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {truckData.phone && (
                <Button variant="outline" className="flex items-center" onClick={() => window.open(`tel:${truckData.phone}`)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              )}

              {truckData.website && (
                <Button variant="outline" className="flex items-center" onClick={() => window.open(truckData.website, '_blank')}>
                  <Globe className="mr-2 h-4 w-4" />
                  Website
                </Button>
              )}

              <Button variant="outline" className="flex items-center" onClick={() => {
                navigator.share?.({
                  title: truckData.name,
                  text: truckData.description,
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied to clipboard" });
                });
              }}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>

              {truckData.socialLinks?.instagram && (
                <Button variant="outline" className="flex items-center" onClick={() => window.open(truckData.socialLinks?.instagram, '_blank')}>
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </Button>
              )}

              {truckData.socialLinks?.facebook && (
                <Button variant="outline" className="flex items-center" onClick={() => window.open(truckData.socialLinks?.facebook, '_blank')}>
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              )}

              {truckData.socialLinks?.twitter && (
                <Button variant="outline" className="flex items-center" onClick={() => window.open(truckData.socialLinks?.twitter, '_blank')}>
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
              )}

              <Button 
                variant={savedToFavorites ? "default" : "outline"} 
                className={`flex items-center ${savedToFavorites ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
                onClick={handleSaveToFavorites}
              >
                <Heart className={`mr-2 h-4 w-4 ${savedToFavorites ? 'fill-white' : ''}`} />
                {savedToFavorites ? 'Saved' : 'Save'}
              </Button>

              <Button variant="default" className="flex items-center ml-auto bg-food-orange hover:bg-food-orange/90" onClick={() => navigate(`/book/${id}`)}>
                <Calendar className="mr-2 h-4 w-4" />
                Book for Event
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-food-orange mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    {locationsData && locationsData.items.length > 0 ? (
                      <>
                        <p className="text-gray-600 text-sm">{locationsData.items[0].address}</p>
                        <Button variant="link" className="p-0 h-auto text-food-orange">
                          View on map
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center text-gray-400 text-sm italic">
                        <MapPinOff className="h-4 w-4 mr-1" />
                        <span>No current location</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-food-orange mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Hours</h3>
                    {truckData.operatingHours ? (
                      <p className="text-gray-600 text-sm">
                        {isOpen()
                          ? `Open today: ${format(new Date(), 'EEEE')}`
                          : `Closed today`
                        }
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Hours not available</p>
                    )}
                    <Button variant="link" className="p-0 h-auto text-food-orange">
                      See all hours
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start">
                  <Utensils className="h-5 w-5 text-food-orange mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Cuisine</h3>
                    <p className="text-gray-600 text-sm capitalize">{truckData.cuisineType}</p>
                    {truckData.tags && truckData.tags.length > 3 && (
                      <Button variant="link" className="p-0 h-auto text-food-orange">
                        More tags
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="menu" className="w-full">
              <TabsList className="w-full justify-start mb-6 bg-gray-100">
                <TabsTrigger value="menu" className="flex items-center">
                  <MenuIcon className="h-4 w-4 mr-2" />
                  Menu
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="pt-2 animate-fade-in">
                {categories && categories.length > 0 ? (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={activeCategory === category ? "default" : "outline"}
                          className={`px-4 py-2 cursor-pointer ${activeCategory === category ? 'bg-food-orange hover:bg-food-orange/90' : 'hover:bg-gray-100'}`}
                          onClick={() => setActiveCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getMenuItemsByCategory(activeCategory).map((item) => (
                        <Card key={item.id} className="flex overflow-hidden hover:shadow-md transition-shadow duration-300">
                          {item.image && (
                            <div className="w-28 h-28 flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-4 flex-grow">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{item.name}</h3>
                              <span className="font-semibold">${item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              {item.isVegetarian && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Vegetarian</Badge>}
                              {item.isVegan && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Vegan</Badge>}
                              {item.isGlutenFree && <Badge variant="outline" className="text-xs">Gluten-Free</Badge>}
                              {item.isPopular && <Badge className="text-xs bg-food-orange/80">Popular</Badge>}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No menu items available.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="pt-2 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Customer Reviews</h2>
                    {truckData.averageRating && (
                      <div className="flex items-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${
                              i < Math.floor(truckData.averageRating) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : i < Math.ceil(truckData.averageRating) && i > Math.floor(truckData.averageRating)
                                  ? 'fill-yellow-400/50 text-yellow-400' 
                                  : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="ml-2 font-semibold">{truckData.averageRating.toFixed(1)}</span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-gray-500">{truckData.totalRatings} reviews</span>
                      </div>
                    )}
                  </div>
                  <Button className="bg-food-orange hover:bg-food-orange/90">Write a Review</Button>
                </div>

                {reviewsData && reviewsData.items && reviewsData.items.length > 0 ? (
                  <div className="space-y-6">
                    {reviewsData.items.map((review) => (
                      <div key={review.id} className="border-b pb-6 animate-fade-in">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <h3 className="font-medium">{review.userName}</h3>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(review.date || '').toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                            {review.images.map((image, i) => (
                              <img 
                                key={i} 
                                src={image} 
                                alt="Review" 
                                className="w-20 h-20 object-cover rounded shadow-sm hover:opacity-90 transition-opacity cursor-pointer" 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <MessageCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to leave a review!</p>
                    <Button className="bg-food-orange hover:bg-food-orange/90">Write a Review</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="info" className="pt-2 animate-fade-in">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">About {truckData.name}</h2>
                    <p className="text-gray-700 leading-relaxed">{truckData.description}</p>
                    
                    {truckData.tags && truckData.tags.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm text-gray-500 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {truckData.tags.map(tag => (
                            <Badge key={tag.id} variant="outline" className="px-3 py-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Operating Hours</h3>
                    {truckData.operatingHours ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {Object.entries(truckData.operatingHours).map(([day, hours]) => {
                          const isToday = day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                          return (
                            <div key={day} className={`flex justify-between py-1 px-2 rounded ${isToday ? 'bg-amber-50' : ''}`}>
                              <span className={`capitalize font-medium ${isToday ? 'text-amber-800' : ''}`}>
                                {day} {isToday && <span className="text-xs ml-1 bg-amber-200 px-1 py-0.5 rounded">Today</span>}
                              </span>
                              <span className={isToday ? 'text-amber-800' : 'text-gray-600'}>
                                {hours && hours.length > 0 ? (
                                  <span>
                                    {hours.map((h, i) => (
                                      <span key={i}>{h.open} - {h.close}{i < hours.length - 1 ? ', ' : ''}</span>
                                    ))}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Closed</span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500">Hours information not available</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {truckData.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 mr-3 text-gray-500" />
                          <a href={`tel:${truckData.phone}`} className="text-food-orange hover:underline">{truckData.phone}</a>
                        </div>
                      )}
                      {truckData.website && (
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 mr-3 text-gray-500" />
                          <a href={truckData.website} target="_blank" rel="noopener noreferrer" className="text-food-orange hover:underline">
                            {truckData.website.replace(/^https?:\/\/(www\.)?/, '')}
                          </a>
                        </div>
                      )}
                      {truckData.socialLinks?.instagram && (
                        <div className="flex items-center">
                          <Instagram className="h-5 w-5 mr-3 text-gray-500" />
                          <a href={truckData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-food-orange hover:underline">
                            {truckData.socialLinks.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@')}
                          </a>
                        </div>
                      )}
                      {truckData.socialLinks?.facebook && (
                        <div className="flex items-center">
                          <Facebook className="h-5 w-5 mr-3 text-gray-500" />
                          <a href={truckData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-food-orange hover:underline">
                            {truckData.socialLinks.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
                          </a>
                        </div>
                      )}
                      {truckData.socialLinks?.twitter && (
                        <div className="flex items-center">
                          <Twitter className="h-5 w-5 mr-3 text-gray-500" />
                          <a href={truckData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-food-orange hover:underline">
                            {truckData.socialLinks.twitter.replace(/^https?:\/\/(www\.)?twitter\.com\//, '@')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Services & Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center p-3 border rounded-md">
                        <div className={`rounded-full p-1 mr-3 ${truckData.deliveryEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {truckData.deliveryEnabled ? <Check className="h-4 w-4" /> : <X size={16} />}
                        </div>
                        <span className={truckData.deliveryEnabled ? "" : "text-gray-500"}>
                          {truckData.deliveryEnabled ? "Delivery Available" : "No Delivery"}
                        </span>
                      </div>
                      <div className="flex items-center p-3 border rounded-md">
                        <div className={`rounded-full p-1 mr-3 ${truckData.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                          {truckData.isPremium ? <Award className="h-4 w-4" /> : <X size={16} />}
                        </div>
                        <span className={truckData.isPremium ? "" : "text-gray-500"}>
                          {truckData.isPremium ? "Premium Vendor" : "Standard Vendor"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="gallery" className="pt-2 animate-fade-in">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Photo Gallery</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {truckData.image && (
                      <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={truckData.image} 
                          alt={`${truckData.name} food truck`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                        />
                      </div>
                    )}
                    
                    {truckData.bannerImage && (
                      <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={truckData.bannerImage} 
                          alt={`${truckData.name} banner`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                        />
                      </div>
                    )}
                    
                    {truckData.logo && (
                      <div className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={truckData.logo} 
                          alt={`${truckData.name} logo`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                        />
                      </div>
                    )}
                    
                    {menuData && menuData.items && menuData.items
                      .filter(item => item.image)
                      .map((item, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                          />
                        </div>
                      ))}
                  </div>
                  
                  {(!truckData.image && !truckData.bannerImage && !truckData.logo && 
                   (!menuData || !menuData.items || !menuData.items.some(item => item.image))) && (
                    <div className="text-center py-16">
                      <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No gallery images available.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodTruckDetails;
