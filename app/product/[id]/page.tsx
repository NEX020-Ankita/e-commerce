'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ShoppingCart, ArrowLeft, Star } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_urls?: string[];
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchProduct(Number(params.id));
    }
  }, [params.id]);

  const fetchProduct = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('id', id)
        .single();
      console.log("data", data, error);
      if (error) {
        console.error('Error fetching product:', error);
      } else {
        setProduct(data);
        // Handle multiple images
        let imageUrls = [];
        if (Array.isArray(data.image_urls)) {
          imageUrls = data.image_urls;
        }
        setImages(imageUrls.filter(Boolean));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
          {/* Main Image */}
          <div className="aspect-square overflow-hidden rounded-lg">
            <Image
              src={
                images[selectedImageIndex] || "/lan.webp"
              }
              alt={product.title}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Thumbnails */}
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
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl">₹{product.price}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded-full text-sm font-semibold">
              4.2 <Star className="h-3 w-3 fill-white ml-1" />
            </div>
            <p className="text-muted-foreground">19 ratings and 0 reviews</p>
          </div>


          <div className="space-y-2">
            <p className="font-semibold">Images</p>
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-blue-600"
                      : "border-gray-200"
                  } cursor-pointer`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Size</p>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Description</p>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <button className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}