"use client";

import { Search, User, Store, MoreVertical, LogOut, ChevronDown, Menu, X } from "lucide-react";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="block">
              <h1 className="text-lg sm:text-2xl font-extrabold italic text-blue-600">
                Flipkart
              </h1>
              <p className="hidden sm:block text-xs font-semibold text-gray-500 -mt-1 flex items-center">
                Explore
                <span className="ml-1 text-yellow-500 font-bold">
                  Plus
                  <span className="text-yellow-400 ml-0.5">+</span>
                </span>
              </p>
            </a>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for Products, Brands and More"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-blue-50/50 border-none focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg h-10"
            />
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="text-gray-800 hover:bg-blue-100"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Cart cart={cart} updateCart={updateCart} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-800 hover:bg-blue-100"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center text-sm lg:text-md font-semibold text-gray-800 hover:bg-blue-100 px-2 lg:px-4 py-2 rounded-md transition-colors"
                >
                  <User className="mr-1 lg:mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden lg:inline">My Profile</span>
                  <ChevronDown className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
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
                className="flex items-center text-sm lg:text-md font-semibold text-gray-800 hover:bg-blue-100 px-2 lg:px-4 py-2 rounded-md transition-colors"
              >
                <User className="mr-1 lg:mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden lg:inline">Login</span>
              </button>
            )}

            <Cart cart={cart} updateCart={updateCart} />

            <a
              href="/main/contact"
              className="flex items-center text-sm lg:text-md font-semibold text-gray-800 hover:bg-blue-100 px-2 lg:px-4 py-2 rounded-md transition-colors"
            >
              <Store className="mr-1 lg:mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              <span className="hidden lg:inline">Contact</span>
            </a>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden py-3 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-blue-50/50 border-none focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg h-9"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-3 border-t bg-white">
            <div className="space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      router.push('/user/orders');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg"
                  >
                    <User className="mr-3 h-5 w-5" />
                    My Orders
                  </button>
                  <button
                    onClick={() => {
                      handleLogoutClick();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLoginClick();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <User className="mr-3 h-5 w-5" />
                  Login
                </button>
              )}
              <a
                href="/main/contact"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center w-full px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <Store className="mr-3 h-5 w-5" />
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
