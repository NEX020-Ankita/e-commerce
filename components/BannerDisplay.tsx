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
      }, 1000); // Auto slide every 3 seconds

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
    <div className="relative w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
      <div className="w-full h-full flex items-center justify-between px-8">
        <div className="flex-1 text-white">
          <h2 className="text-3xl font-bold mb-4">{banners[currentBanner].title}</h2>
          <p className="text-lg mb-4">{banners[currentBanner].description}</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Learn More
          </button>
        </div>

        {banners[currentBanner].image_url && (
          <div className="flex-1 flex justify-center items-center">
            <img
              src={banners[currentBanner].image_url}
              alt={banners[currentBanner].title}
              className="w-96 h-48 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
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

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBanner ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}