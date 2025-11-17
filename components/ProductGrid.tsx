'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  created_at: string;
}

interface ProductGridProps {
  categoryFilter?: string | null;
  searchTerm?: string;
  cart: {[key: number]: number};
  updateCart: (productId: number, quantity: number) => void;
}

export function ProductGrid({ categoryFilter, searchTerm, cart, updateCart }: ProductGridProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (typeof window !== 'undefined') {
          console.error('Error fetching products:', error);
        }
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('Error:', error);
      }
    }
  };

  const addToCart = (productId: number) => {
    updateCart(productId, ((cart && cart[productId]) || 0) + 1);
  };

  const getCartCount = (productId: number) => (cart && cart[productId]) || 0;

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">
          {searchTerm ? `Search Results for "${searchTerm}"` : categoryFilter ? `${categoryFilter} Products` : 'All Products'}
        </h2>
        {filteredProducts.length === 0 && (categoryFilter || searchTerm) && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? `No products found for "${searchTerm}"` : `No products found in ${categoryFilter} category.`}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
              <div 
                className="relative cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <Image
                  src={product.image_url || '/lan.webp'}
                  alt={product.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 
                  className="text-lg font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                    {getCartCount(product.id) > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
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