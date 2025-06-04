import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Calendar as CalendarIcon,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useLoginReport } from "@/hooks/reports/useLoginReport";
import { api } from "@/services/api/client";

// Updated User interface based on the API response
interface User {
  id: string;
  name: string;
  role_id: number;
  roles: {
    id: number;
    role: string;
  };
  employee_outlet_id: number;
  restaurants_users_employee_outlet_idTorestaurants?: {
    id: number;
    name: string;
  };
  restaurant_id: number;
  restaurants_users_restaurant_idTorestaurants?: {
    id: number;
    name: string;
  };
  username: string;
  email?: string;
  phone_no?: string;
  status: number;
}

interface UsersApiResponse {
  users: User[];
  total: number;
}

// Custom hook to fetch users
const useGetUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isLoadingRef = useRef(false);
  
  const fetchUsers = async () => {
    // Prevent duplicate API calls
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      const response = await api.get<UsersApiResponse>('/users');
      console.log("Users API response:", response);
      
      if (response && response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error : new Error('Unknown error fetching users'));
      toast({
        title: "Error loading users",
        description: "Could not fetch users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  return { users, isLoading, error, fetchUsers };
};

const LoginReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const { users, isLoading: isLoadingUsers } = useGetUsers();
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedUser, setSelectedUser] = useState("0");
  const [date, setDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewBy, setViewBy] = useState<'Day' | 'Week'>("Week");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Use the custom hook for login report data
  const { 
    data: loginData,
    isLoading,
    refetch
  } = useLoginReport({
    restaurantId: selectedLocation,
    userId: selectedUser,
    viewBy,
    selectedDate: date,
    page: currentPage,
    perPage
  });

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    refetch();
    toast({ title: "Refreshing data..." });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
  };

  const handleViewByChange = (value: 'Day' | 'Week') => {
    setViewBy(value);
  };

  const handleEditLogoutTime = (id: string) => {
    // Implement edit logout time functionality
    console.log("Edit logout time for ID:", id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Login Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
        {/* Date Picker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Date</span>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate || new Date());
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Location Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Location</span>
          <Select value={selectedLocation} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">User</span>
          <Select value={selectedUser} onValueChange={handleUserChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="0">All Users</SelectItem>
              {isLoadingUsers ? (
                <SelectItem value="loading" disabled>Loading users...</SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* View By Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">By</span>
          <Select value={viewBy} onValueChange={handleViewByChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Week">Week</SelectItem>
              <SelectItem value="Day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Button */}
        <div className="flex items-end justify-end">
          <Button variant="outline" onClick={handleRefresh} className="w-10 h-10 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium">Name</TableHead>
                <TableHead className="text-white font-medium">Location</TableHead>
                <TableHead className="text-white font-medium">Logged in time</TableHead>
                <TableHead className="text-white font-medium">Logged out time</TableHead>
                <TableHead className="text-white font-medium text-right">Login hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loginData || !loginData.data || loginData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No data available for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                loginData.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      {item.logged_in_time ? format(new Date(item.logged_in_time), "yyyy-MM-dd HH:mm:ss") : '-'}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {item.logged_out_time ? (
                        <>
                          {format(new Date(item.logged_out_time), "yyyy-MM-dd HH:mm:ss")}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => handleEditLogoutTime(item.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => handleEditLogoutTime(item.id)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.login_hours || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LoginReport;
