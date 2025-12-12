"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  title: string;
  price: number;
  image_urls?: string[];
}

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  cart: { [key: number]: number };
  updateCart: (productId: number, quantity: number) => void;
}

export function Cart({ cart, updateCart }: CartProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchCartItems();
  }, [cart]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCartItems = async () => {
    const productIds = Object.keys(cart).map(Number);
    if (productIds.length === 0) {
      setCartItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("product")
        .select("id, title, price, image_urls")
        .in("id", productIds);

      if (error) {
        console.error("Error fetching cart items:", error);
      } else {
        const items =
          data?.map((product) => {
            console.log("Product image_urls:", product.image_urls);
            return {
              ...product,
              image_url: Array.isArray(product.image_urls)
                ? product.image_urls[0]
                : product.image_urls,
              quantity: cart[product.id],
            };
          }) || [];
        setCartItems(items);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      updateCart(productId, 0);
    } else {
      updateCart(productId, newQuantity);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          if (!user) {
            router.push('/phonelogin');
            return;
          }
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-4 py-2 text-md font-semibold text-gray-800 hover:bg-blue-100 rounded-md transition-colors"
      >
        <ShoppingCart className="h-5 w-5" />
        Cart ({totalItems})
      </button>

      {isOpen && user && (
        <div className="absolute right-0 top-12 w-96 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Shopping Car</h3>
          </div>

          {cartItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border-b flex items-center gap-3"
                  >
                    <Image
                      src={Array.isArray(item.image_urls) && item.image_urls.length > 0 ? item.image_urls[0] : "/lan.webp"}
                      alt={item.title}
                      width={50}
                      height={50}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-blue-600 font-semibold">
                        ₹{item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateCart(item.id, 0)}
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">
                    Total: ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/cart");
                  }}
                  className="w-full bg-yellow-300 text-white py-2 rounded hover:bg-yellow-400 transition-colors"
                >
                  View Cart
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
