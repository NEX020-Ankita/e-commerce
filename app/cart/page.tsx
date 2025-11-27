'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_urls?: string[];
}

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) {
        setLoading(false);
        return;
      }

      const cart = JSON.parse(cartData);
      const productIds = Object.keys(cart).map(Number);

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: products, error } = await supabase
        .from('product')
        .select('*')
        .in('id', productIds);

      if (error) {
        console.error('Error fetching cart products:', error);
        setLoading(false);
        return;
      }

      const items: CartItem[] = products?.map(product => ({
        ...product,
        quantity: cart[product.id] || 0
      })) || [];

      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);

    // Update localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    cart[productId] = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const removeItem = (productId: number) => {
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);

    // Update localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    delete cart[productId];
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            

          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">   </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex-shrink-0 w-20 h-20 mr-4">
                  <Image
                    src={
                      Array.isArray(item.image_urls) && item.image_urls.length > 0
                        ? item.image_urls[0]
                        : '/lan.webp'
                    }
                    alt={item.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                  <p className="text-lg font-bold text-blue-600">₹{item.price}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Items ({getTotalItems()})</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}