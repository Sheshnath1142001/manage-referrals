
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { login } from "@/lib/authService";
import { AlertCircle } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Note: This has optional chaining removed since login requires email and password
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      toast({
        title: "Sign in failed",
        description: err.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-food-green">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-food-coral hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-food-green hover:bg-food-green/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54v-2.203c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 2.891h-2.33v6.988c4.781-.75 8.437-4.887 8.437-9.878z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center space-y-2 p-6 bg-gray-50 rounded-b-lg">
            <div className="text-center text-sm text-muted-foreground">
              <span>Don't have an account? </span>
              <Link to="/register" className="text-food-coral font-medium hover:underline">
                Create an account
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <span>Are you a food truck owner? </span>
              <Link to="/owner-dashboard" className="text-food-green font-medium hover:underline">
                Owner Dashboard
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <a href="/terms" className="font-medium text-food-coral hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="font-medium text-food-coral hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default SignIn;
