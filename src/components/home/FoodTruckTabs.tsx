
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Loader2 } from "lucide-react";
import { FoodTruck } from "@/lib/types";
import { Tag } from "@/lib/tagService";

interface FoodTruckTabsProps {
  popularFoodTrucks: FoodTruck[];
  nearbyFoodTrucks: FoodTruck[];
  popularTags: Tag[];
}

const FoodTruckTabs = ({
  popularFoodTrucks = [],
  nearbyFoodTrucks = [],
  popularTags = []
}: FoodTruckTabsProps) => {
  const [activeTab, setActiveTab] = useState("nearby");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTagClick = (tagId: string) => {
    // Only set active tag if it exists in popularTags
    if (popularTags.some(tag => tag.id === tagId)) {
      setActiveTag(activeTag === tagId ? null : tagId);
    }
  };

  // Filter trucks based on active tag
  const getFilteredTrucks = (trucks: FoodTruck[]) => {
    if (!activeTag) return trucks;

    // Only filter if the active tag exists in popularTags
    if (!popularTags.some(tag => tag.id === activeTag)) {
      return trucks;
    }

    return trucks.filter(truck =>
      truck.tags?.some(tag => tag === activeTag)
    );
  };

  const filteredPopular = getFilteredTrucks(popularFoodTrucks);
  const filteredNearby = getFilteredTrucks(nearbyFoodTrucks);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-food-green font-viga">Discover Food Trucks</h2>
        <p className="text-gray-600 mb-6">
          Showing food trucks from your area and popular options
        </p>

        {/* Tag filtering */}
        {popularTags.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex gap-2 flex-nowrap">
              {popularTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={activeTag === tag.id ? "default" : "outline"}
                  className={`px-3 py-1 cursor-pointer whitespace-nowrap ${
                    activeTag === tag.id ? "bg-food-orange hover:bg-food-orange/90" : ""
                  }`}
                  onClick={() => handleTagClick(tag.id)}
                >
                  {tag.name} {tag.foodTruckCount && `(${tag.foodTruckCount})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="nearby" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger
              value="nearby"
              className="data-[state=active]:bg-food-green data-[state=active]:text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Near You
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-food-coral data-[state=active]:text-white"
            >
              <Star className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="mt-0">
            {filteredNearby.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNearby.map(truck => (
                  <FoodTruckCard key={truck.id} truck={truck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {activeTag
                    ? "No nearby food trucks found with the selected tag. Try another filter."
                    : "No food trucks found in your area yet. Try exploring popular trucks instead!"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            {filteredPopular.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPopular.map(truck => (
                  <FoodTruckCard key={truck.id} truck={truck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {activeTag
                    ? "No popular food trucks found with the selected tag. Try another filter."
                    : "No popular food trucks available at the moment."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <Button
            onClick={() => navigate('/search')}
            variant="outline"
            className="border-food-green text-food-green hover:bg-food-green/10"
          >
            View All Food Trucks
          </Button>
        </div>
      </div>
    </section>
  );
};

// Separate component for food truck cards
const FoodTruckCard = ({ truck }: { truck: FoodTruck }) => {
  return (
    <Link to={`/food-trucks/${truck.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="relative h-40">
          <img
            src={truck.imageUrl || "https://placehold.co/600x400?text=No+Image"}
            alt={truck.name}
            className="w-full h-full object-cover"
          />
          {truck.tags && truck.tags.length > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/80 text-gray-800">
                {truck.tags[0]}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold truncate">{truck.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-food-yellow text-food-yellow mr-1" />
              <span className="text-sm font-medium">{truck.rating?.toFixed(1) || "New"}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{truck.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {truck.location ? (
              <span className="truncate">{truck.location.address}</span>
            ) : (
              <span className="italic">No location available</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FoodTruckTabs;
