'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';
import Image from 'next/image';

interface Order {
  id: number;
  user_id: string;
  items: any[];
  total_amount: number;
  delivery_address: any;
  status: string;
  order_date: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);
  

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Process each order to fetch complete product details
      const processedOrders = await Promise.all(
        (ordersData || []).map(async (order) => {
          let processedItems = [];
          
          // If items exist and have product IDs, fetch full product details
          if (Array.isArray(order.items) && order.items.length > 0) {
            const productIds = order.items.map((item: any) => item.id).filter(Boolean);
            
            if (productIds.length > 0) {
              const { data: products } = await supabase
                .from('product')
                .select('*')
                .in('id', productIds);
              
              // Merge order item data with product data
              processedItems = order.items.map((orderItem: any) => {
                const productData = products?.find(p => p.id === orderItem.id);
                return {
                  ...productData,
                  ...orderItem, // Keep quantity and other order-specific data
                  image_url: productData?.image_urls?.[0] || productData?.image_url || '/lan.webp'
                };
              });
            } else {
              processedItems = order.items;
            }
          }

          return {
            ...order,
            items: processedItems
          };
        })
      );

      console.log('Raw orders from DB:', ordersData);
      console.log('Processed orders:', processedOrders);
      
      // Debug first order
      if (processedOrders.length > 0) {
        console.log('First order items:', processedOrders[0].items);
        console.log('First order address:', processedOrders[0].delivery_address);
       
      }
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order status');
      } else {
        fetchOrders(); // Refresh orders
        alert('Order status updated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <AdminAuth>
        <AdminLayout>
          <div className="text-center py-8">Loading orders...</div>
        </AdminLayout>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items & Images</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-sm space-y-2">
                          {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                              <Image
                                src={item.image_url || '/lan.webp'}
                                alt={item.title || 'Product'}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-xs truncate">{item.title || 'No title'}</div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-xs text-red-500">No items</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.total_amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {order.delivery_address ? (
                            <>
                              <div className="font-medium">{order.delivery_address.name || 'No name'}</div>
                              <div className="text-xs text-gray-500">{order.delivery_address.phone || 'No phone'}</div>
                              <div className="text-xs">{order.delivery_address.address || 'No address'}</div>
                              <div className="text-xs">{order.delivery_address.city || 'No city'}, {order.delivery_address.state || 'No state'}</div>
                              {order.delivery_address.pincode && (
                                <div className="text-xs text-gray-500">{order.delivery_address.pincode}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-red-500">No address data</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="block w-full px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          View Details
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refund">Refund</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-gray-600">Order #{selectedOrder.id} • {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-light"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? selectedOrder.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex gap-4">
                          <Image
                            src={item.image_url || '/lan.webp'}
                            alt={item.title || 'Product'}
                            width={100}
                            height={100}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <h4 className="font-bold text-lg">{item.title || 'No title'}</h4>
                            {item.description && (
                              <p className="text-gray-700 text-sm">{item.description}</p>
                            )}
                            {item.category && (
                              <p className="text-sm text-blue-600 font-medium">Category: {item.category}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Unit Price:</span>
                                <span className="ml-2 text-green-600 font-semibold">₹{item.price || 0}</span>
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span>
                                <span className="ml-2 font-semibold">{item.quantity || 0}</span>
                              </div>
                              <div>
                                <span className="font-medium">Subtotal:</span>
                                <span className="ml-2 text-blue-600 font-bold">₹{(item.price || 0) * (item.quantity || 0)}</span>
                              </div>
                              {item.id && (
                                <div>
                                  <span className="font-medium">Product ID:</span>
                                  <span className="ml-2 text-gray-600">#{item.id}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-red-500">No items found in this order</p>
                    )}
                  </div>
                </div>
                
                {/* Delivery Address */}
                <div>
                  <h3 className="font-semibold mb-3">Delivery Information</h3>
                  {selectedOrder.delivery_address ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-lg">{selectedOrder.delivery_address.name || 'Name not provided'}</p>
                          <p className="text-blue-600 font-medium">{selectedOrder.delivery_address.phone || 'Phone not provided'}</p>
                        </div>
                        <div className="text-right md:text-left">
                          <p className="text-sm text-gray-600">Delivery Address</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="font-medium">{selectedOrder.delivery_address.address || 'Address not provided'}</p>
                        <p className="text-gray-700">
                          {selectedOrder.delivery_address.city || 'City not provided'}, {selectedOrder.delivery_address.state || 'State not provided'}
                          {selectedOrder.delivery_address.pincode && ` - ${selectedOrder.delivery_address.pincode}`}
                        </p>
                        {selectedOrder.delivery_address.landmark && (
                          <p className="text-gray-600 text-sm">📍 Landmark: {selectedOrder.delivery_address.landmark}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-600 font-medium">⚠️ No delivery address found for this order</p>
                      <p className="text-red-500 text-sm mt-1">Please contact the customer for address details</p>
                    </div>
                  )}
                </div>
                
                {/* Order Summary */}
                <div className="border-t pt-4 bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order ID:</span>
                      <span className="font-mono text-gray-600">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Items:</span>
                      <span>{Array.isArray(selectedOrder.items) ? selectedOrder.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">₹{selectedOrder.total_amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status:</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Customer ID:</span>
                      <span className="font-mono text-gray-600">{selectedOrder.user_id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminAuth>
  );
}