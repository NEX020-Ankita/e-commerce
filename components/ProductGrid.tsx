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

  const addToCart = (productId: number) => {
    const newQuantity = (cart[productId] || 0) + 1;
    updateCart(productId, newQuantity);
  };

  const getCartCount = (productId: number) => (cart && cart[productId]) || 0;

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 tracking-tight">
          {searchTerm
            ? `Search Results for "${searchTerm}"`
            : categoryFilter
            ? `${categoryFilter} Products`
            : "All Products"}
        </h2>

        {filteredProducts.length === 0 && (categoryFilter || searchTerm) && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `No products found for "${searchTerm}"`
                : `No products found in ${categoryFilter} category.`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-5">
                <h3
                  className="text-lg font-semibold text-gray-900 tracking-tight mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {product.description.replace(/<[^>]*>/g, '')}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    ₹{product.price}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add
                    {getCartCount(product.id) > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs shadow">
                        {getCartCount(product.id)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
