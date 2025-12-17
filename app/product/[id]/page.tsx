"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { DescriptionRenderer } from "@/components/DescriptionRenderer";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_urls?: string[];
  offer_percentage?: number;
  rating: number;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // 🚀 FIXED: Buy Now Handler
  const handleBuyNow = () => {
    if (!product) return;
    router.push(`/checkout?productId=${product.id}`);
  };

  useEffect(() => {
    if (params.id) {
      const id = Number(params.id);
      fetchProduct(id);
      fetchRatings(id);
    }
  }, [params.id]);

  const fetchProduct = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);

        // Handle multiple images
        let imageUrls: string[] = [];
        if (Array.isArray(data.image_urls)) {
          imageUrls = data.image_urls;
        }
        setImages(imageUrls.filter(Boolean));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("product")
        .select("rating")
        .eq("id", id);

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }

      if (data && data.length > 0) {
        const ratings = data.map((r) => r.rating);
        const avg =
          ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

        setAverageRating(Math.round(avg * 10) / 10);
        setTotalRatings(ratings.length);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!product) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login to rate this product");
        return;
      }

      const { error } = await supabase
        .from("product")
        .update({
          rating: rating,
        })
        .eq("id", product.id)
        .select();

      if (error) {
        console.error("Error saving rating:", error);
        alert("Failed to save rating");
        return;
      }

      setUserRating(rating);
      fetchRatings(product.id);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save rating");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <Image
              src={images[selectedImageIndex] || "/lan.webp"}
              alt={product.title}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <div className="flex items-center gap-4">
            {product.offer_percentage ? (
              <div className="flex flex-col gap-1">
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.price}
                </span>
                <span className="font-bold text-3xl text-green-600">
                  ₹{(product.price * (1 - product.offer_percentage / 100)).toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium w-fit">
                  {product.offer_percentage}% OFF
                </span>
              </div>
            ) : (
              <span className="font-semibold text-2xl">₹{product.price}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {averageRating > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{averageRating}</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({totalRatings} rating{totalRatings !== 1 ? "s" : ""})
                </span>
              </>
            )}
          </div>

          {/* Rate product */}
          <div className="space-y-2">
            <p className="font-semibold">Rate this product</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || userRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="font-semibold">Description</p>
            <div className="text-gray-700 leading-relaxed">
              {isDescriptionExpanded ? (
                <div>
                  <DescriptionRenderer content={product.description} />
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="text-blue-600 hover:underline text-sm mt-2 font-medium"
                  >
                    Show less
                  </button>
                </div>
              ) : (
                <div>
                  <div className="line-clamp-3">
                    {product.description.replace(/<[^>]*>/g, '').substring(0, 150)}
                  </div>
                  {product.description.replace(/<[^>]*>/g, '').length > 150 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(true)}
                      className="text-blue-600 hover:underline text-sm mt-1 font-medium"
                    >
                      ...more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  if (!user) {
                    alert('Please login to add items to cart');
                    return;
                  }

                  // Check if item exists in cart
                  const { data: existingItem } = await supabase
                    .from('cart')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .maybeSingle();

                  if (existingItem) {
                    // Update quantity
                    const { error } = await supabase
                      .from('cart')
                      .update({ quantity: existingItem.quantity + 1 })
                      .eq('id', existingItem.id);
                    
                    if (error) {
                      console.error('Error updating cart:', error);
                      alert('Failed to update cart');
                      return;
                    }
                  } else {
                    // Insert new item with product details
                    const { error } = await supabase
                      .from('cart')
                      .insert({ 
                        user_id: user.id, 
                        product_id: product.id, 
                        quantity: 1,
                        title: product.title,
                        price: product.price,
                        image_urls: product.image_urls
                      });
                    
                    if (error) {
                      console.error('Error adding to cart:', error);
                      alert('Failed to add to cart');
                      return;
                    }
                  }

                  alert('Added to cart successfully!');
                } catch (error) {
                  console.error('Error:', error);
                  alert('Failed to add to cart');
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            {/* 🚀 FIXED BUY NOW BUTTON */}
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
