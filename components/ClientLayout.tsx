'use client';

import { useState, useEffect } from 'react';
import { ConditionalHeader } from './ConditionalHeader';
import { ConditionalFooter } from './ConditionalFooter';
import { supabase } from '@/lib/supabase';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

function ClientLayoutContent({ children }: ClientLayoutProps) {
  const [cart, setCart] = useState<{[key: number]: number}>({});
  const { setSearchTerm } = useSearch();

  useEffect(() => {
    loadCart();
    
    const channel = supabase
      .channel('cart-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cart' },
        () => loadCart()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('cart')
      .select('product_id, quantity')
      .eq('user_id', user.id);

    const cartData: {[key: number]: number} = {};
    data?.forEach(item => {
      cartData[item.product_id] = item.quantity;
    });
    setCart(cartData);
  };

  const updateCart = (productId: number, quantity: number) => {
    const newCart = { ...cart };
    if (quantity <= 0) {
      delete newCart[productId];
    } else {
      newCart[productId] = quantity;
    }
    setCart(newCart);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
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

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SearchProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </SearchProvider>
  );
}