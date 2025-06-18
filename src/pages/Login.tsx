
import { useState, useEffect } from "react";
import { Building2, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatTime } from '@/utils/dateUtils';

const Login = () => {
  const [clientId, setClientId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { login, isLoading, isAuthenticated, isAuthChecked } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthChecked && isAuthenticated()) {
      
      navigate("/", { replace: true });
    }
  }, [isAuthChecked, isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const validateForm = () => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Company Code is required",
        variant: "destructive",
      });
      return false;
    }
    if (isNaN(Number(clientId))) {
      toast({
        title: "Error",
        description: "Company Code should be a number",
        variant: "destructive",
      });
      return false;
    }
    if (!username) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return false;
    }
    if (!password) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      
      
      await login({
        username,
        password,
        clientId
      });
      
    } catch (error) {
      
      // Error handling is done in the login function
    }
  };

  // Show loading while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E5DEFF] via-[#D3E4FD] to-[#F1F0FB]">
        <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.1)_100%)] backdrop-blur-[100px]"></div>
        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.03"/>
                <stop offset="50%" stopColor="#eee" stopOpacity="0.01"/>
                <stop offset="100%" stopColor="#fff" stopOpacity="0.03"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grain)"/>
          </svg>
        </div>
      </div>
      
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 relative">
        <div className="max-w-md">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.svg" 
              alt="Pratham Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome To <span className="text-gray-900 bg-gray-200 px-2 py-1 rounded">Pratham</span> Admin
          </h1>
          <p className="text-gray-600 mb-6">
            Log in to access your dashboard and manage your business operations efficiently.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">Real-time dashboard with business analytics</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">Inventory management with low stock alerts</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">Detailed reporting on sales and performance</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">User management with role-based access control</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex justify-center items-center p-4 sm:p-8 relative">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-gray-600 font-medium">ADMIN</h2>
              <div className="text-2xl sm:text-3xl font-bold">{formatTime(currentTime)}</div>
              <div className="text-gray-600 text-sm sm:text-base">{formatDate(currentTime)}</div>
              <div className="text-gray-500 text-xs sm:text-sm mt-1">V3.4.0</div>
            </div>

            <Card className="shadow-none border-0">
              <CardContent className="p-0">
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Login</h1>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="space-y-4 sm:space-y-5">
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Company Code"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                        />
                      </div>

                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 uppercase"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
