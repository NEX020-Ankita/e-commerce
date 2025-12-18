'use client';

import { useState, useEffect } from 'react';
import MainPage from "./main/page";
import { ProductGrid } from "@/components/ProductGrid";
import { supabase } from "@/lib/supabase";
import { useSearch } from "@/contexts/SearchContext";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const { searchTerm } = useSearch();
  

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

  return (
    <div>
      <MainPage onCategoryFilter={setCategoryFilter} cart={cart} updateCart={updateCart} />
      <ProductGrid categoryFilter={categoryFilter} searchTerm={searchTerm} cart={cart} updateCart={updateCart} />
    </div>
  );
}
