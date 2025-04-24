import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-center mb-8">
              Sign in to your LocalFoodTruck.au account
            </p>
            <AuthForm type="login" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}