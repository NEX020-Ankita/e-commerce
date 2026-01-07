"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_urls?: string[];
  offer_percentage?: number;
  created_at: string;
}

interface ProductGridProps {
  categoryFilter?: string | null;
  searchTerm?: string;
  cart: { [key: number]: number };
  updateCart: (productId: number, quantity: number) => void;
}

export function ProductGrid({
  categoryFilter,
  searchTerm,
  cart,
  updateCart,
}: ProductGridProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (categoryFilter) {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please login to add items to cart');
        return;
      }

      // Check if item exists in cart
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      // Get product details
      const { data: productData } = await supabase
        .from('product')
        .select('title, price, image_urls')
        .eq('id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) {
          console.error('Error updating cart:', error);
          return;
        }
      } else {
        // Insert new item with product details
        const { error } = await supabase
          .from('cart')
          .insert({ 
            user_id: user.id, 
            product_id: productId, 
            quantity: 1,
            title: productData?.title,
            price: productData?.price,
            image_urls: productData?.image_urls
          });
        
        if (error) {
          console.error('Error adding to cart:', error);
          return;
        }
      }

      // Update local cart state
      const newQuantity = (cart[productId] || 0) + 1;
      updateCart(productId, newQuantity);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCartCount = (productId: number) => (cart && cart[productId]) || 0;

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  if (products.length === 0) {
    return (
      <section className="">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            All Products
          </h2>
          <p className="text-gray-500">
            No products available. Add products from the admin panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className=" bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800 tracking-tight px-4">
         {searchTerm
            ? `Search Results for "${searchTerm}"`
            : categoryFilter
            ? `${categoryFilter} Products`
            : ""}
       </h2>

        {filteredProducts.length === 0 && (categoryFilter || searchTerm) && (
          <div className="text-center py-8 sm:py-10 px-4">
            <p className="text-gray-500 text-base sm:text-lg">
              {searchTerm
                ? `No products found for "${searchTerm}"`
                : `No products found in ${categoryFilter} category.`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="relative cursor-pointer overflow-hidden"
                onClick={() => handleProductClick(product.id)}
              >
                <Image
                  src={
                    Array.isArray(product.image_urls) &&
                    product.image_urls.length > 0
                      ? product.image_urls[0]
                      : "/lan.webp"
                  }
                  alt={product.title}
                  width={300}
                  height={200}
                  className="w-full h-48 sm:h-52 lg:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-4 sm:p-5">
                <h3
                  className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                  {product.description.replace(/<[^>]*>/g, '')}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    {product.offer_percentage ? (
                      <>
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                          ₹{(product.price * (1 - product.offer_percentage / 100)).toFixed(2)}
                        </span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium w-fit">
                          {product.offer_percentage}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-blue-600">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  {getCartCount(product.id) > 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/cart');
                      }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow hover:bg-green-700 active:scale-95 transition-all w-full sm:w-auto"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Go to Cart</span>
                      <span className="sm:hidden">View Cart</span>
                      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs shadow">
                        {getCartCount(product.id)}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow hover:bg-blue-700 active:scale-95 transition-all w-full sm:w-auto"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Add</span>
                      <span className="sm:hidden">Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
