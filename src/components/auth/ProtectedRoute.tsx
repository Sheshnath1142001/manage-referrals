
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isAuthChecked, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute check:', { isAuthChecked, isAuthenticated: isAuthenticated(), isLoading });
  
  // Show loading state while checking auth or during login
  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If auth check is complete and user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If auth check is complete and user is authenticated, render the children
  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
};
