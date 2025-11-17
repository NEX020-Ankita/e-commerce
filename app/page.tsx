'use client';

import { useState } from 'react';
import MainPage from "./main/page";
import { ProductGrid } from "@/components/ProductGrid";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<{[key: number]: number}>({});

  const updateCart = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  return (
    <div>
      <MainPage onCategoryFilter={setCategoryFilter} cart={cart} updateCart={updateCart} onSearch={setSearchTerm} />
      <ProductGrid categoryFilter={categoryFilter} searchTerm={searchTerm} cart={cart} updateCart={updateCart} />
    </div>
  );
}
