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
  authVersion: number;
  login: (credentials: LoginCredentials & { clientId: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  /**
   * Allow children components to update the cached user object (e.g. after profile edit).
   */
  setUser: (user: User | null) => void;
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
  const [authVersion, setAuthVersion] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Only read from localStorage once on initial mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        
        const adminData = localStorage.getItem('Admin');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData) as AuthResponse;
          if (parsedAdmin.token && parsedAdmin.user) {
            
            setToken(parsedAdmin.token);
            setUser(parsedAdmin.user);
          }
        }
      } catch (error) {
        
        localStorage.removeItem('Admin');
        localStorage.removeItem('token');
      } finally {
        setIsAuthChecked(true);
        
      }
    };

    initializeAuth();
  }, []);

 // In your login function, convert the string ID to number:

const login = async (credentials: LoginCredentials & { clientId: string }) => {
  try {
    setIsLoading(true);
    
    
    const authData = await authApi.login(
      credentials.username,
      credentials.password,
      Number(credentials.clientId)
    );
    
    if (authData.token && authData.user) {
      
      
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
      
      // Clear any tenant-specific caches from previous sessions
      if (window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('tenant_') || key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Increment auth version to trigger re-renders
      setAuthVersion(prev => prev + 1);
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    }
  } catch (error: any) {
    
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
    
    const previousUser = user;
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('Admin');
    localStorage.removeItem('token');
    
    // Clear all React Query cache to prevent showing old tenant data
    
    queryClient.clear();
    
    // Clear any other persistent caches
    if (window.localStorage) {
      // Clear any other app-specific cache keys if needed
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('tenant_') || key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Increment auth version to trigger re-renders
    setAuthVersion(prev => prev + 1);
    
    navigate('/login');
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
    
    
  };

  const isAuthenticated = () => {
    const result = !!token && !!user;
    
    return result;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthChecked,
    authVersion,
    login,
    logout,
    isAuthenticated,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
