"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Define the exact shape of your Supabase table
interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  landmark: string | null;
  address: string;
  is_default: boolean;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    landmark: "",
    address: "",
  });

  // 1. Fetch saved addresses from Supabase
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/checkout");
        return;
      }

      const { data, error } = await supabase
        .from("address")
        .select("*")
        .eq("user_id", user.id) // Get addresses WHERE user_id = current user
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAddresses(data || []);

      // Automatically select the default address or the first one found
      if (data && data.length > 0) {
        const defaultAddr = data.find((a) => a.is_default);
        setSelectedAddress(defaultAddr ? defaultAddr.id : data[0].id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const cartData = localStorage.getItem("cart");
      if (!cartData) return;

      const cart = JSON.parse(cartData);
      const productIds = Object.keys(cart).map(Number);

      if (productIds.length === 0) return;

      const { data: products, error } = await supabase
        .from("product")
        .select("*")
        .in("id", productIds);

      if (error) throw error;

      const items =
        products?.map((product) => ({
          ...product,
          quantity: cart[product.id] || 0,
        })) || [];

      setCartItems(items);
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalAmount(total);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setPlacingOrder(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const selectedAddr = addresses.find(
        (addr) => addr.id === selectedAddress
      );

      if (!selectedAddr) {
        alert("Selected address not found. Please try again.");
        return;
      }

      console.log('Placing order with address:', selectedAddr);
      console.log('Cart items being saved:', cartItems);

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        items: cartItems,
        total_amount: totalAmount,
        delivery_address: selectedAddr,
        status: "pending",
        order_date: new Date().toISOString(),
      });

      if (error) throw error;

      // Clear cart
      localStorage.removeItem("cart");

      alert("Order placed successfully! Admin will confirm your order soon.");
      router.push("/");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Delete Address Handler
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the row when clicking delete
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const { error } = await supabase.from("address").delete().eq("id", id);
      if (error) throw error;
      await fetchAddresses(); // Refresh list
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // 3. Submit New Address
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("address").insert({
        ...formData,
        user_id: user.id,
        is_default: addresses.length === 0, // Make default if it's the first one
      });

      if (error) throw error;

      await fetchAddresses(); // Refresh table
      setShowAddressForm(false);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        pincode: "",
        state: "",
        city: "",
        landmark: "",
        address: "",
      });
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">Loading addresses...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Delivery Address</h3>
              {!showAddressForm && (
                <Button size="sm" onClick={() => setShowAddressForm(true)}>
                  + Add New Address
                </Button>
              )}
            </div>
            <CardContent className="pt-6">
              {!showAddressForm ? (
                addresses.length > 0 ? (
                  <div className="overflow-x-auto">
                    {/* TABLE VIEW START */}
                    <table className="w-full text-sm text-left text-gray-600 border border-gray-200 rounded-lg">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 w-10">
                            Select
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Name & Phone
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Address Details
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Location
                          </th>
                          <th scope="col" className="px-4 py-3 text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {addresses.map((addr) => (
                          <tr
                            key={addr.id}
                            className={`bg-white border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedAddress === addr.id
                                ? "bg-blue-50 border-blue-200"
                                : ""
                            }`}
                            onClick={() => setSelectedAddress(addr.id)}
                          >
                            <td className="px-4 py-4">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  selectedAddress === addr.id
                                    ? "border-blue-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedAddress === addr.id && (
                                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-900">
                              <div>{addr.name}</div>
                              <div className="text-gray-500 text-xs mt-1">
                                {addr.phone}
                              </div>
                              {addr.is_default && (
                                <span className="mt-1 inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Default
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="line-clamp-2">{addr.address}</div>
                              {addr.landmark && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Near: {addr.landmark}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                {addr.city}, {addr.state}
                              </div>
                              <div className="text-xs text-gray-500">
                                {addr.pincode}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDelete(addr.id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* TABLE VIEW END */}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No addresses found.</p>
                    <Button
                      variant="link"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Create your first address
                    </Button>
                  </div>
                )
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Phone Number
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Flat/House No, Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-sm font-medium">Pincode</label>
                      <Input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Landmark (Optional)
                    </label>
                    <Input
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Order Summary</h3>
            </div>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({cartItems.length} items)
                </span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={
                  !selectedAddress || placingOrder || cartItems.length === 0
                }
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </Button>

              {!selectedAddress && (
                <p className="text-xs text-red-500 text-center">
                  Please select an address to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
