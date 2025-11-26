'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrderItem {
  id: number;
  title: string;
  color?: string;
  price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  statusDate: string;
  message?: string;
  image: string;
  quantity: number;
}

interface Order {
  id: number;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/phonelogin');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        // Process orders to get product details
        const processedOrders = await Promise.all(
          (data || []).map(async (order) => {
            if (Array.isArray(order.items) && order.items.length > 0) {
              const productIds = order.items.map((item: any) => item.id).filter(Boolean);
              
              if (productIds.length > 0) {
                const { data: products } = await supabase
                  .from('product')
                  .select('*')
                  .in('id', productIds);
                
                const processedItems = order.items.map((orderItem: any) => {
                  const productData = products?.find(p => p.id === orderItem.id);
                  return {
                    ...productData,
                    ...orderItem,
                    image: productData?.image_urls?.[0] || productData?.image_url || '/lan.webp'
                  };
                });
                
                return { ...order, items: processedItems };
              }
            }
            return order;
          })
        );
        
        setOrders(processedOrders);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOrderItems = (orders: Order[]): OrderItem[] => {
    const items: OrderItem[] = [];
    
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          items.push({
            id: item.id || Math.random(),
            title: item.title || 'Product',
            color: item.category || 'N/A',
            price: item.price || 0,
            status: order.status as any,
            statusDate: new Date(order.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            message: order.status === 'delivered' ? 'Your item has been delivered' : undefined,
            image: item.image || '/lan.webp',
            quantity: item.quantity || 1
          });
        });
      }
    });
    
    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-8">Loading your orders...</div>
        </div>
      </div>
    );
  }

  const orderItems = formatOrderItems(orders);

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {orderItems.map((item, index) => (
            <OrderCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ item }: { item: OrderItem }) {
  const isDelivered = item.status === "delivered";
  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500", 
    shipped: "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500"
  };

  return (
    <Card className="flex flex-col md:flex-row p-4 gap-4 md:gap-6 items-start md:items-center bg-white rounded-sm border border-gray-200 shadow-sm transition-all hover:shadow-md">
      {/* Section 1: Image */}
      <div className="relative w-20 h-20 flex-shrink-0 border rounded-sm overflow-hidden bg-gray-100">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-contain p-1"
        />
      </div>

      {/* Section 2: Title & Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900 truncate pr-4">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">Category: {item.color}</p>
        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
      </div>

      {/* Section 3: Price */}
      <div className="w-full md:w-auto md:min-w-[80px]">
        <span className="text-base font-medium text-gray-900">
          ₹{item.price}
        </span>
      </div>

      {/* Section 4: Status & Actions */}
      <div className="w-full md:w-64 space-y-2">
        <div className="flex items-center gap-2">
          {/* Status Dot */}
          <div
            className={`w-2.5 h-2.5 rounded-full ${statusColors[item.status]}`}
          />
          
          {/* Status Text */}
          <span className="text-sm font-semibold text-gray-900 capitalize">
            {item.status} on {item.statusDate}
          </span>
        </div>

        {/* Conditional Message */}
        {item.message && (
          <p className="text-xs text-gray-500 pl-4.5 -mt-1">{item.message}</p>
        )}

        {/* Rate & Review Link (Only for Delivered items) */}
        {isDelivered && (
          <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors pl-4.5 pt-1 group">
            <Star className="w-4 h-4 fill-blue-600 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Rate & Review Product</span>
          </button>
        )}
      </div>
    </Card>
  );
}