import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Calendar as CalendarIcon,
  Pencil,
  PrinterIcon
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
import { api } from "@/services/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// Login report data interface
interface LoginReportItem {
  id: string;
  user_id: string;
  users: {
    id: string;
    name: string;
    username: string;
    role_id: number;
    roles: {
      id: number;
      role: string;
    };
    restaurant_id: number;
    restaurants_users_restaurant_idTorestaurants: {
      id: number;
      name: string;
      type: number;
      restaurant_type: number;
      status: number;
      logo_image_id: string;
      owner_id: string;
      created_by: string;
      created_at: string;
      updated_by: string | null;
      updated_at: string;
      restaurant_unique_id: string;
      receiver_email: string;
      timezone: string | null;
      company_code: string | null;
      customer_website_url: string | null;
    };
  };
  logged_in_time: string;
  logged_out_time: string | null;
  created_at: string;
  // Legacy fields for backward compatibility
  user_name?: string;
  login_time?: string;
  logout_time?: string;
  duration?: string;
  location?: string;
  name?: string;
  login_hours?: string;
}

interface LoginReportResponse {
  page: number;
  per_page: number;
  created_at_from: string;
  created_at_to: string;
  week_start_date: string;
  data?: LoginReportItem[];
  report?: LoginReportItem[];
  total?: number;
}

// Edit Login Time Dialog Component
interface EditLoginTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loginRecord: LoginReportItem | null;
  onSubmit: (id: string, loginTime: string, logoutTime: string | null) => void;
  isSubmitting?: boolean;
}

const EditLoginTimeDialog = ({ 
  open, 
  onOpenChange, 
  loginRecord, 
  onSubmit, 
  isSubmitting = false 
}: EditLoginTimeDialogProps) => {
  const [loginDate, setLoginDate] = useState("");
  const [loginTime, setLoginTime] = useState("");
  const [suggestedLogoutDate, setSuggestedLogoutDate] = useState("");
  const [suggestedLogoutTime, setSuggestedLogoutTime] = useState("");

  useEffect(() => {
    if (loginRecord && open) {
      // Parse login time
      if (loginRecord.logged_in_time || loginRecord.login_time) {
        const loginDateTime = new Date(loginRecord.logged_in_time || loginRecord.login_time!);
        setLoginDate(format(loginDateTime, "yyyy-MM-dd"));
        setLoginTime(format(loginDateTime, "HH:mm:ss"));
        
        // Calculate suggested logout time
        calculateSuggestedLogoutTime(loginDateTime);
      }
    }
  }, [loginRecord, open]);

  // Function to calculate suggested logout time based on login time
  const calculateSuggestedLogoutTime = (loginDateTime: Date) => {
    const suggestedLogoutDateTime = new Date(loginDateTime);
    suggestedLogoutDateTime.setHours(suggestedLogoutDateTime.getHours() + 8);
    
    // If the calculated logout time is on the next day, keep it on the same day
    // but set it to a reasonable end time (e.g., 18:00:00)
    if (suggestedLogoutDateTime.getDate() !== loginDateTime.getDate()) {
      suggestedLogoutDateTime.setDate(loginDateTime.getDate());
      suggestedLogoutDateTime.setHours(18, 0, 0, 0);
    }
    
    setSuggestedLogoutDate(format(suggestedLogoutDateTime, "yyyy-MM-dd"));
    setSuggestedLogoutTime(format(suggestedLogoutDateTime, "HH:mm:ss"));
  };

  // Update suggested logout time when login time changes
  const handleLoginTimeChange = (newDate: string, newTime: string) => {
    if (newDate && newTime) {
      const newLoginDateTime = new Date(`${newDate}T${newTime}`);
      calculateSuggestedLogoutTime(newLoginDateTime);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginRecord || !loginDate || !loginTime) return;

    const loginDateTime = `${loginDate}T${loginTime}.000Z`;
    // Keep the existing logout time unchanged
    const existingLogoutTime = loginRecord.logged_out_time || loginRecord.logout_time || null;

    onSubmit(loginRecord.id, loginDateTime, existingLogoutTime);
  };

  const handleReset = () => {
    if (loginRecord) {
      // Reset to original values
      if (loginRecord.logged_in_time || loginRecord.login_time) {
        const loginDateTime = new Date(loginRecord.logged_in_time || loginRecord.login_time!);
        setLoginDate(format(loginDateTime, "yyyy-MM-dd"));
        setLoginTime(format(loginDateTime, "HH:mm:ss"));
        calculateSuggestedLogoutTime(loginDateTime);
      }
    }
  };

  // Function to update both login and logout times
  const handleUpdateBothTimes = () => {
    if (!loginRecord || !loginDate || !loginTime) return;

    const loginDateTime = `${loginDate}T${loginTime}.000Z`;
    const logoutDateTime = `${suggestedLogoutDate}T${suggestedLogoutTime}.000Z`;

    onSubmit(loginRecord.id, loginDateTime, logoutDateTime);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Login Time: {loginRecord?.users?.username || 'User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Login Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="login-date">Date*</Label>
                <Input
                  id="login-date"
                  type="date"
                  value={loginDate}
                  onChange={(e) => {
                    setLoginDate(e.target.value);
                    handleLoginTimeChange(e.target.value, loginTime);
                  }}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-time">Time*</Label>
                <Input
                  id="login-time"
                  type="time"
                  step="1"
                  value={loginTime}
                  onChange={(e) => {
                    setLoginTime(e.target.value);
                    handleLoginTimeChange(loginDate, e.target.value);
                  }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Suggested Logout Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Suggested Logout Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suggested-logout-date">Date</Label>
                <Input
                  id="suggested-logout-date"
                  type="date"
                  value={suggestedLogoutDate}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggested-logout-time">Time</Label>
                <Input
                  id="suggested-logout-time"
                  type="time"
                  step="1"
                  value={suggestedLogoutTime}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Suggested logout time is 8 hours after login time. You can update both times together using the button below.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleUpdateBothTimes}
              disabled={isSubmitting}
            >
              Update Both Times
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Login Only"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Logout Time Dialog Component
interface EditLogoutTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loginRecord: LoginReportItem | null;
  onSubmit: (id: string, loginTime: string, logoutTime: string | null) => void;
  isSubmitting?: boolean;
}

const EditLogoutTimeDialog = ({ 
  open, 
  onOpenChange, 
  loginRecord, 
  onSubmit, 
  isSubmitting = false 
}: EditLogoutTimeDialogProps) => {
  const [logoutDate, setLogoutDate] = useState("");
  const [logoutTime, setLogoutTime] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (loginRecord && open) {
      // Get the login time to set default logout time
      const loginTime = loginRecord.logged_in_time || loginRecord.login_time;
      
      if (loginTime) {
        const loginDateTime = new Date(loginTime);
        
        // Check if there's an existing logout time
        if (loginRecord.logged_out_time || loginRecord.logout_time) {
          const logoutDateTime = new Date(loginRecord.logged_out_time || loginRecord.logout_time!);
          setLogoutDate(format(logoutDateTime, "yyyy-MM-dd"));
          setLogoutTime(format(logoutDateTime, "HH:mm:ss"));
        } else {
          // Set default logout time based on login time
          // Add 8 hours to login time as default work duration
          const defaultLogoutDateTime = new Date(loginDateTime);
          defaultLogoutDateTime.setHours(defaultLogoutDateTime.getHours() + 8);
          
          // If the calculated logout time is on the next day, keep it on the same day
          // but set it to a reasonable end time (e.g., 18:00:00)
          if (defaultLogoutDateTime.getDate() !== loginDateTime.getDate()) {
            defaultLogoutDateTime.setDate(loginDateTime.getDate());
            defaultLogoutDateTime.setHours(18, 0, 0, 0);
          }
          
          setLogoutDate(format(defaultLogoutDateTime, "yyyy-MM-dd"));
          setLogoutTime(format(defaultLogoutDateTime, "HH:mm:ss"));
        }
      } else {
        // Fallback to current date/time if no login time exists
        const now = new Date();
        setLogoutDate(format(now, "yyyy-MM-dd"));
        setLogoutTime(format(now, "HH:mm:ss"));
      }
      
      // Clear validation error when dialog opens
      setValidationError("");
    }
  }, [loginRecord, open]);

  // Validate logout time is after login time
  const validateLogoutTime = () => {
    const loginTime = loginRecord?.logged_in_time || loginRecord?.login_time;
    if (!loginTime || !logoutDate || !logoutTime) return true;

    const loginDateTime = new Date(loginTime);
    const logoutDateTime = new Date(`${logoutDate}T${logoutTime}`);
    
    if (logoutDateTime <= loginDateTime) {
      setValidationError("Logout time must be after login time");
      return false;
    }
    
    setValidationError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginRecord || !logoutDate || !logoutTime) return;

    if (!validateLogoutTime()) return;

    const logoutDateTime = `${logoutDate}T${logoutTime}.000Z`;
    // Keep the existing login time unchanged
    const existingLoginTime = loginRecord.logged_in_time || loginRecord.login_time || '';

    onSubmit(loginRecord.id, existingLoginTime, logoutDateTime);
  };

  const handleReset = () => {
    if (loginRecord) {
      // Get the login time to set default logout time
      const loginTime = loginRecord.logged_in_time || loginRecord.login_time;
      
      if (loginTime) {
        const loginDateTime = new Date(loginTime);
        
        // Check if there's an existing logout time
        if (loginRecord.logged_out_time || loginRecord.logout_time) {
          const logoutDateTime = new Date(loginRecord.logged_out_time || loginRecord.logout_time!);
          setLogoutDate(format(logoutDateTime, "yyyy-MM-dd"));
          setLogoutTime(format(logoutDateTime, "HH:mm:ss"));
        } else {
          // Set default logout time based on login time
          // Add 8 hours to login time as default work duration
          const defaultLogoutDateTime = new Date(loginDateTime);
          defaultLogoutDateTime.setHours(defaultLogoutDateTime.getHours() + 8);
          
          // If the calculated logout time is on the next day, keep it on the same day
          // but set it to a reasonable end time (e.g., 18:00:00)
          if (defaultLogoutDateTime.getDate() !== loginDateTime.getDate()) {
            defaultLogoutDateTime.setDate(loginDateTime.getDate());
            defaultLogoutDateTime.setHours(18, 0, 0, 0);
          }
          
          setLogoutDate(format(defaultLogoutDateTime, "yyyy-MM-dd"));
          setLogoutTime(format(defaultLogoutDateTime, "HH:mm:ss"));
        }
      } else {
        // Fallback to current date/time if no login time exists
        const now = new Date();
        setLogoutDate(format(now, "yyyy-MM-dd"));
        setLogoutTime(format(now, "HH:mm:ss"));
      }
      
      setValidationError("");
    }
  };

  // Function to set logout time based on login time
  const setLogoutTimeBasedOnLogin = () => {
    if (loginRecord) {
      const loginTime = loginRecord.logged_in_time || loginRecord.login_time;
      
      if (loginTime) {
        const loginDateTime = new Date(loginTime);
        
        // Add 8 hours to login time as default work duration
        const defaultLogoutDateTime = new Date(loginDateTime);
        defaultLogoutDateTime.setHours(defaultLogoutDateTime.getHours() + 8);
        
        // If the calculated logout time is on the next day, keep it on the same day
        // but set it to a reasonable end time (e.g., 18:00:00)
        if (defaultLogoutDateTime.getDate() !== loginDateTime.getDate()) {
          defaultLogoutDateTime.setDate(loginDateTime.getDate());
          defaultLogoutDateTime.setHours(18, 0, 0, 0);
        }
        
        setLogoutDate(format(defaultLogoutDateTime, "yyyy-MM-dd"));
        setLogoutTime(format(defaultLogoutDateTime, "HH:mm:ss"));
        setValidationError("");
      }
    }
  };

  // Get formatted login time for display
  const getFormattedLoginTime = () => {
    const loginTime = loginRecord?.logged_in_time || loginRecord?.login_time;
    if (!loginTime) return "Not available";
    
    try {
      return format(new Date(loginTime), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Logout Time: {loginRecord?.users?.username || 'User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Login Time Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Login Time</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">{getFormattedLoginTime()}</span>
            </div>
          </div>

          {/* Logout Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Logout Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logout-date">Date*</Label>
                <Input
                  id="logout-date"
                  type="date"
                  value={logoutDate}
                  onChange={(e) => {
                    setLogoutDate(e.target.value);
                    validateLogoutTime();
                  }}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logout-time">Time*</Label>
                <Input
                  id="logout-time"
                  type="time"
                  step="1"
                  value={logoutTime}
                  onChange={(e) => {
                    setLogoutTime(e.target.value);
                    validateLogoutTime();
                  }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Validation Error */}
            {validationError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {validationError}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !!validationError}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
      
      
      // Handle both direct data and axios wrapper - properly type the response
      const data: UsersApiResponse = (response as any).data || response;
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      
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

// Custom hook for login report data
const useLoginReportData = () => {
  const { toast } = useToast();
  const [loginData, setLoginData] = useState<LoginReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLoginReport = async (params: {
    page: number;
    per_page: number;
    created_at_from: string;
    created_at_to: string;
    week_start_date: string;
    viewBy?: string;
    userId?: string;
    locationId?: string;
  }) => {
    setIsLoading(true);
    try {
      
      
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        per_page: params.per_page.toString(),
        created_at_from: params.created_at_from,
        created_at_to: params.created_at_to,
        week_start_date: params.week_start_date
      });

      // Add optional parameters
      if (params.userId && params.userId !== "0") {
        queryParams.append('user_id', params.userId);
      }
      if (params.locationId && params.locationId !== "0") {
        queryParams.append('restaurant_id', params.locationId);
      }

      const response = await api.get<LoginReportResponse>(`/login-data?${queryParams.toString()}`);
      
      
      // Handle both direct data and axios wrapper - properly type the response
      const data: LoginReportResponse = (response as any).data || response;
      setLoginData(data);
      setError(null);
    } catch (error) {
      
      setError(error instanceof Error ? error : new Error('Unknown error fetching login report'));
      toast({
        title: "Error loading login report",
        description: "Could not fetch login report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { loginData, isLoading, error, fetchLoginReport };
};

const LoginReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const { users, isLoading: isLoadingUsers } = useGetUsers();
  const { loginData, isLoading, fetchLoginReport } = useLoginReportData();
  
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedUser, setSelectedUser] = useState("0");
  const [date, setDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewBy, setViewBy] = useState<'Day' | 'Week' | 'Month'>("Day");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Edit dialog state
  const [isEditLoginDialogOpen, setIsEditLoginDialogOpen] = useState(false);
  const [isEditLogoutDialogOpen, setIsEditLogoutDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LoginReportItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate date range based on viewBy selection
  const getDateRange = () => {
    const currentDate = new Date(date);
    let startDate = "";
    let endDate = "";

    switch (viewBy) {
      case 'Day':
        // For Day view, use the selected date for both start and end
        startDate = format(currentDate, "yyyy/MM/dd");
        endDate = format(currentDate, "yyyy/MM/dd");
        break;
      case 'Week':
        // For Week view, calculate from Sunday to Saturday
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
        startDate = format(startOfWeek, "yyyy/MM/dd");
        endDate = format(endOfWeek, "yyyy/MM/dd");
        break;
      case 'Month':
        // For Month view, use first and last day of the month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        startDate = format(startOfMonth, "yyyy/MM/dd");
        endDate = format(endOfMonth, "yyyy/MM/dd");
        break;
    }

    return { startDate, endDate };
  };

  // Fetch data when filters change
  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    
    fetchLoginReport({
      page: currentPage,
      per_page: perPage,
      created_at_from: startDate,
      created_at_to: endDate,
      week_start_date: "Sunday",
      viewBy,
      userId: selectedUser,
      locationId: selectedLocation
    });
  }, [selectedLocation, selectedUser, date, viewBy, currentPage, perPage]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    const { startDate, endDate } = getDateRange();
    fetchLoginReport({
      page: currentPage,
      per_page: perPage,
      created_at_from: startDate,
      created_at_to: endDate,
      week_start_date: "Sunday",
      viewBy,
      userId: selectedUser,
      locationId: selectedLocation
    });
    toast({ title: "Refreshing data..." });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleViewByChange = (value: 'Day' | 'Week' | 'Month') => {
    setViewBy(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleEditLoginTime = (id: string) => {
    // Find the record to edit from reportData
    const reportData = loginData?.data || loginData?.report || [];
    const recordToEdit = reportData.find(item => item.id === id);
    if (recordToEdit) {
      setEditingRecord(recordToEdit);
      setIsEditLoginDialogOpen(true);
    }
  };

  const handleEditLogoutTime = (id: string) => {
    // Find the record to edit from reportData
    const reportData = loginData?.data || loginData?.report || [];
    const recordToEdit = reportData.find(item => item.id === id);
    if (recordToEdit) {
      setEditingRecord(recordToEdit);
      setIsEditLogoutDialogOpen(true);
    }
  };

  // Function to update login record
  const handleUpdateLoginRecord = async (id: string, loginTime: string, logoutTime: string | null) => {
    setIsUpdating(true);
    try {
      // Find the record to get user_id
      const reportData = loginData?.data || loginData?.report || [];
      const recordToUpdate = reportData.find(item => item.id === id);
      
      if (!recordToUpdate) {
        throw new Error("Record not found");
      }

      // Determine if we're updating login or logout time
      const isUpdatingLogin = isEditLoginDialogOpen;
      const timestamp = isUpdatingLogin ? loginTime : logoutTime;

      // Subtract 5 hours and 30 minutes from the timestamp
      const date = new Date(timestamp);
      date.setHours(date.getHours() - 5);
      date.setMinutes(date.getMinutes() - 30);
      const adjustedTimestamp = date.toISOString();

      const updateData = {
        user_id: recordToUpdate.user_id,
        timestamp: adjustedTimestamp,
        update_id: id,
        isLogin: isUpdatingLogin
      };

      // Make API call to update the login record using the correct endpoint
      const response = await api.post('/report/update-login-logout-report', updateData);
      
      toast({
        title: "Success",
        description: `${isUpdatingLogin ? 'Login' : 'Logout'} time updated successfully`,
      });

      // Close dialog and refresh data
      setIsEditLoginDialogOpen(false);
      setIsEditLogoutDialogOpen(false);
      setEditingRecord(null);
      
      // Refresh the report data
      const { startDate, endDate } = getDateRange();
      fetchLoginReport({
        page: currentPage,
        per_page: perPage,
        created_at_from: startDate,
        created_at_to: endDate,
        week_start_date: "Sunday",
        viewBy,
        userId: selectedUser,
        locationId: selectedLocation
      });

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${isEditLoginDialogOpen ? 'login' : 'logout'} time. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to calculate login hours
  const calculateLoginHours = (loginTime: string, logoutTime: string | null) => {
    if (!loginTime || !logoutTime) return '-';
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout.getTime() - login.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Get the data array from response
  const reportData = loginData?.data || loginData?.report || [];

  return (
    <>
      {/* Print-specific styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            display: block !important;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          
          .print-table th {
            background-color: #d1d5db !important;
            color: #111827 !important;
            font-weight: bold;
          }
          
          .print-table .text-right {
            text-align: right;
          }
          
          .print-info {
            margin-bottom: 15px;
            font-size: 14px;
          }
        }
        `
      }} />

      <div className="p-6 print-container">
        <div className="flex justify-between items-center mb-6 no-print">
          <div className="flex items-center gap-4">
          </div>
          {/* <div className="text-sm text-[#9b87f5] font-medium flex items-center gap-2">
            ADMIN
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4" />
            </Button>
          </div> */}
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="print-header" style={{ display: 'none' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Login Report</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end no-print">
          {/* Date Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Date</span>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end justify-end gap-2">
            <Button variant="outline" onClick={handlePrint} className="w-10 h-10 p-0">
              <PrinterIcon className="h-4 w-4" />
            </Button>
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
            <Table className="print-table">
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
                {!reportData || reportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No data available for the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        {item.users?.name || item.user_name || item.name || '-'}
                      </TableCell>
                      <TableCell>
                        {item.users?.restaurants_users_restaurant_idTorestaurants?.name || item.location || '-'}
                      </TableCell>
                      <TableCell>
                        {(item.logged_in_time || item.login_time) ? 
                          <div className="flex items-center gap-2">
                            {format(new Date(item.logged_in_time || item.login_time!), "yyyy-MM-dd HH:mm:ss")}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 no-print"
                              onClick={() => handleEditLoginTime(item.id)}
                              title="Edit login time"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                          : '-'}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {(item.logged_out_time || item.logout_time) ? (
                          <>
                            {format(new Date(item.logged_out_time || item.logout_time!), "yyyy-MM-dd HH:mm:ss")}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 no-print"
                              onClick={() => handleEditLogoutTime(item.id)}
                              title="Edit logout time"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Not logged out</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 no-print"
                              onClick={() => handleEditLogoutTime(item.id)}
                              title="Edit logout time"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {calculateLoginHours(
                          item.logged_in_time || item.login_time || '', 
                          item.logged_out_time || item.logout_time || null
                        ) || item.duration || item.login_hours || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {isEditLoginDialogOpen && editingRecord && (
          <EditLoginTimeDialog
            open={isEditLoginDialogOpen}
            onOpenChange={setIsEditLoginDialogOpen}
            loginRecord={editingRecord}
            onSubmit={handleUpdateLoginRecord}
            isSubmitting={isUpdating}
          />
        )}

        {isEditLogoutDialogOpen && editingRecord && (
          <EditLogoutTimeDialog
            open={isEditLogoutDialogOpen}
            onOpenChange={setIsEditLogoutDialogOpen}
            loginRecord={editingRecord}
            onSubmit={handleUpdateLoginRecord}
            isSubmitting={isUpdating}
          />
        )}
      </div>
    </>
  );
};

export default LoginReport;
