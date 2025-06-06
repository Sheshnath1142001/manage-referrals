import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "@/services/api/auth";
import { toast } from "@/hooks/use-toast";
import { AuthResponse, User, LoginCredentials } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthChecked: boolean;
  login: (credentials: LoginCredentials & { clientId: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Only read from localStorage once on initial mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('Initializing auth...');
        const adminData = localStorage.getItem('Admin');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData) as AuthResponse;
          if (parsedAdmin.token && parsedAdmin.user) {
            console.log('Found existing auth data');
            setToken(parsedAdmin.token);
            setUser(parsedAdmin.user);
          }
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('Admin');
        localStorage.removeItem('token');
      } finally {
        setIsAuthChecked(true);
        console.log('Auth check completed');
      }
    };

    initializeAuth();
  }, []);

 // In your login function, convert the string ID to number:

const login = async (credentials: LoginCredentials & { clientId: string }) => {
  try {
    setIsLoading(true);
    console.log('Attempting login with endpoint /v2/users/admin/login...');
    
    const authData = await authApi.login(
      credentials.username,
      credentials.password,
      Number(credentials.clientId)
    );
    
    if (authData.token && authData.user) {
      console.log('Login successful');
      
      // Convert string ID to number if needed
      const userWithNumberId = {
        ...authData.user,
        id: Number(authData.user.id) // Convert string to number
      };
      
      setToken(authData.token);
      setUser(userWithNumberId);
      
      // Store in localStorage
      localStorage.setItem('Admin', JSON.stringify({
        token: authData.token,
        session_token: authData.session_token,
        user: userWithNumberId
      }));
      
      // Clear all React Query cache data to ensure fresh data for new tenant
      queryClient.clear();
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    }
  } catch (error: any) {
    console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('Admin');
    localStorage.removeItem('token');
    
    // Clear all React Query cache to prevent showing old tenant data
    queryClient.clear();
    
    navigate('/login');
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const isAuthenticated = () => {
    const result = !!token && !!user;
    console.log('Auth check result:', result);
    return result;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthChecked,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
