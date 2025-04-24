"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerAnalytics, FoodTruck } from "@/types";

interface AnalyticsDashboardProps {
  analytics: OwnerAnalytics;
  truck: FoodTruck;
}

const AnalyticsDashboard = ({ analytics, truck }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState("week");

  // Map popular items to their names for display
  const popularItemsData = analytics.popularItems.map((item) => {
    const menuItem = truck.menu.find((menuItem) => menuItem.id === item.itemId);
    return {
      name: menuItem?.name || "Unknown Item",
      count: item.count,
    };
  });

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select
          defaultValue={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Profile Views</CardTitle>
            <CardDescription>{analytics.profileViews} views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.viewsByDay}>
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Average Rating</CardTitle>
            <CardDescription>{analytics.averageRating.toFixed(1)} / 5.0</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth="10"
                  strokeDasharray={`${(analytics.averageRating / 5) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Reviews</CardTitle>
            <CardDescription>{analytics.reviewsCount} reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { rating: 5, count: Math.round(analytics.reviewsCount * 0.6) },
                  { rating: 4, count: Math.round(analytics.reviewsCount * 0.25) },
                  { rating: 3, count: Math.round(analytics.reviewsCount * 0.1) },
                  { rating: 2, count: Math.round(analytics.reviewsCount * 0.03) },
                  { rating: 1, count: Math.round(analytics.reviewsCount * 0.02) },
                ]}>
                  <Bar dataKey="count" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="reviews">Review Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="traffic" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Profile Views</CardTitle>
              <CardDescription>
                See how many people viewed your profile each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.viewsByDay}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1) / 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="popular" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Menu Items</CardTitle>
              <CardDescription>
                Items most frequently viewed and ordered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={popularItemsData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                          <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--background))",
                              borderColor: "hsl(var(--border))",
                            }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={popularItemsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {popularItemsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--background))",
                              borderColor: "hsl(var(--border))",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Trends</CardTitle>
              <CardDescription>
                Showing how your ratings have changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", rating: 4.2 },
                      { month: "Feb", rating: 4.3 },
                      { month: "Mar", rating: 4.1 },
                      { month: "Apr", rating: 4.4 },
                      { month: "May", rating: 4.6 },
                      { month: "Jun", rating: 4.7 },
                      { month: "Jul", rating: 4.8 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[3, 5]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;