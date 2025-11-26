'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Banner {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export function BannerDisplay() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 3000); // Auto slide every 3 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching banners:', error);
      } else {
        setBanners(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index: number) => {
    setCurrentBanner(index);
  };

  if (loading) {
    return <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>;
  }

  if (banners.length === 0) {
    return (
      <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-xl">
      {/* Sliding Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div 
            key={banner.id}
            className="min-w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-between px-8"
          >
            <div className="flex-1 text-white space-y-4">
              <h2 className="text-4xl font-bold leading-tight">{banner.title}</h2>
              <p className="text-xl opacity-90 leading-relaxed">{banner.description}</p>
              <div className="flex gap-4">
                <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                  Shop Now
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all">
                  Learn More
                </button>
              </div>
            </div>

            {banner.image_url && (
              <div className="flex-1 flex justify-center items-center">
                <div className="relative">
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    width={400}
                    height={300}
                    className="w-96 h-60 object-cover rounded-xl shadow-2xl transform hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBanner ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}