'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

interface ConditionalHeaderProps {
  cart?: { [key: number]: number };
  updateCart?: (productId: number, quantity: number) => void;
  onSearch?: (searchTerm: string) => void;
}

export function ConditionalHeader({ cart = {}, updateCart = () => {}, onSearch }: ConditionalHeaderProps) {
  const pathname = usePathname();
  
  // Hide header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Header cart={cart} updateCart={updateCart} onSearch={onSearch} />;
}