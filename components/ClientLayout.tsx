'use client';

import { useState, useEffect } from 'react';
import { ConditionalHeader } from './ConditionalHeader';
import { ConditionalFooter } from './ConditionalFooter';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
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

  const handleSearch = (searchTerm: string) => {
    // This can be handled by individual pages
  };

  return (
    <>
      <ConditionalHeader cart={cart} updateCart={updateCart} onSearch={handleSearch} />
      <div className="flex-1">
        {children}
      </div>
      <ConditionalFooter />
    </>
  );
}