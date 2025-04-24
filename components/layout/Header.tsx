"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium transition-colors hover:text-primary">
                  Home
                </Link>
                <Link href="/search" className="text-lg font-medium transition-colors hover:text-primary">
                  Find Food Trucks
                </Link>
                <Link href="/about" className="text-lg font-medium transition-colors hover:text-primary">
                  About Us
                </Link>
                <Link href="/contact" className="text-lg font-medium transition-colors hover:text-primary">
                  Contact
                </Link>
                <div className="mt-4">
                  <Link href="/login">
                    <Button className="w-full bg-[#C55D5D] hover:bg-[#b34d4d] text-white">
                      Log In
                    </Button>
                  </Link>
                </div>
                <div className="mt-2">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full border-[#C55D5D] text-[#C55D5D]">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="ml-4 md:ml-0 flex items-center gap-2">
            <Image 
              src="./assets/images/logo.png" 
              alt="LocalFoodTruck.au" 
              width={40} 
              height={40} 
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center ml-10 space-x-6">
            <Link href="/" className="font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/search" className="font-medium transition-colors hover:text-primary">
              Find Food Trucks
            </Link>
            <Link href="/about" className="font-medium transition-colors hover:text-primary">
              About Us
            </Link>
            <Link href="/contact" className="font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {isSearchOpen ? (
            <div className="relative w-full max-w-[300px]">
              <Input
                type="search"
                placeholder="Search for food trucks or cuisine..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          <Link href="/favorites">
            <Button variant="ghost" size="icon" aria-label="Favorites">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          <div className="hidden sm:block">
            <Link href="/login">
              <Button className="bg-[#C55D5D] hover:bg-[#b34d4d] text-white">
                Log In
              </Button>
            </Link>
          </div>

          <div className="hidden sm:block">
            <Link href="/signup">
              <Button variant="outline" className="border-[#C55D5D] text-[#C55D5D]">
                Sign Up
              </Button>
            </Link>
          </div>

          <Link href="/account" className="sm:hidden">
            <Button variant="ghost" size="icon" aria-label="Account">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;