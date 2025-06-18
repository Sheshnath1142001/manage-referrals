import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export const PageHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user: currentUser } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/") return "Dashboard";
    if (path === "/transactions" || path === "/orders") return "Transactions";
    if (path === "/categories") return "Categories";
    if (path === "/items") return "Item Library";
    if (path === "/location") return "Location Management";
    if (path === "/location-items") return "Location Items";
    if (path === "/reports") return "Reports";
    if (path === "/reports/sales") return "Sales Report";
    if (path === "/reports/entity-sales") return "Entity Sales Report";
    if (path === "/reports/modifier-sales") return "Modifier Sales Report";
    if (path === "/reports/login") return "Login Report";
    if (path === "/reports/cash-card") return "Cash & Card Reports";
    if (path === "/reports/hourly-sales") return "Hourly Sales Report";
    if (path === "/reports/top-performers") return "Top Performers Report";
    if (path === "/reports/refund") return "Refund Report";
    if (path === "/reports/everyday-sales") return "Everyday Sales Report";
    if (path === "/reports/cashup") return "Cashup Report";
    if (path === "/reports/advance-cash") return "Advance Cash Report";
    if (path === "/reports/category-sales") return "Category Sales Report";
    if (path === "/reports/attendance") return "Cloak In Out Report";
    if (path === "/modifiers-categories") return "Modifiers Categories";
    if (path === "/modifiers-screen") return "Modifiers";
    if (path === "/profile") return "Profile";
    if (path === "/order-refunds") return "Order Refunds";
    if (path === "/order-status") return "Order Status";
    if (path === "/promotions") return "Promotions";
    if (path === "/product-attributes") return "Product Attributes";
    if (path === "/customers") return "Customers";
    
    return path.substring(1).charAt(0).toUpperCase() + path.substring(2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      
      toast({
        title: "Logout Error",
        description: "There was an issue logging out, but you've been logged out locally.",
        variant: "destructive",
      });
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 border-b border-gray-100 bg-white sticky top-0 z-30">
      <SidebarTrigger className="mr-2 sm:mr-4" />
      <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[50vw]">{getPageTitle()}</h1>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link to="/profile">
          <Button variant="ghost" className="flex items-center gap-2 px-3">
            <UserCircle className="h-5 w-5" />
            <span className="hidden sm:inline">{currentUser?.name || 'Admin'}</span>
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setIsLogoutDialogOpen(true)}
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
        
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be logged out of your current session and redirected to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-red-500 text-white hover:bg-red-600"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};
