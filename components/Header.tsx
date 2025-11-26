"use client";

import { Search, User, Store, MoreVertical, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Cart } from "@/components/Cart";

interface HeaderProps {
  cart?: { [key: number]: number };
  updateCart?: (productId: number, quantity: number) => void;
  onSearch?: (searchTerm: string) => void;
}

export function Header({
  cart = {},
  updateCart = () => {},
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLoginClick = () => {
    router.push("/phonelogin");
  };

  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <header className="bg-indigo-50 shadow-lg sticky top-0 z-50 border-b bg-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 mr-6">
            <a href="#" className="block">
              <h1 className="text-2xl font-extrabold italic text-blue-600">
                Flipkart
              </h1>
              <p className="text-xs font-semibold text-blue-800 -mt-1 flex items-center">
                Explore
                <span className="ml-1 text-yellow-500 font-bold">
                  Plus
                  <span className="text-yellow-400 ml-0.5">+</span>
                </span>
              </p>
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for Products, Brands and More"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-blue-50/50 border-none focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg h-10"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 ml-8">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center text-md font-semibold text-b hover:bg-white px-4 py-2 rounded-md transition-colors"
                >
                  <User className="mr-2 h-5 w-5" />
                  My Profile
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 top-12 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        router.push('/user/orders');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        handleLogoutClick();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 rounded-b-lg border-t"
                    >
                      <LogOut className="inline mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center text-md font-semibold text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
              >
                <User className="mr-2 h-5 w-5" />
                Login
              </button>
            )}

            <Cart cart={cart} updateCart={updateCart} />

            <a
              href="/main/contact"
              className="flex items-center text-md font-semibold text-gray-800"
            >
              <Store className="mr-2 h-5 w-5" />
              contact
            </a>

            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5 text-gray-800" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
