'use client';

import { useState, useEffect } from 'react';
import MainPage from "./main/page";
import { ProductGrid } from "@/components/ProductGrid";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<{[key: number]: number}>({});

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (productId: number, quantity: number) => {
    const newCart = { ...cart };
    if (quantity <= 0) {
      delete newCart[productId];
    } else {
      newCart[productId] = quantity;
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  return (
    <div>
      <MainPage onCategoryFilter={setCategoryFilter} cart={cart} updateCart={updateCart} onSearch={setSearchTerm} />
      <ProductGrid categoryFilter={categoryFilter} searchTerm={searchTerm} cart={cart} updateCart={updateCart} />
    </div>
  );
}
