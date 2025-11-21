'use client';


import Image from "next/image";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CategoryNavProps {
  onCategoryFilter?: (category: string | null) => void;
}

interface Category {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
}



export function CategoryNav({ onCategoryFilter }: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  
  console.log('CategoryNav rendered, categories count:', categories.length);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        console.log('Fetched categories:', data);
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCategoryClick = (categoryName: string | null) => {
    if (onCategoryFilter) {
      onCategoryFilter(categoryName);
    }
  };
  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto py-4">
        {categories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No categories available. Add categories from admin panel.</p>
          </div>
        ) : (
          <div className="flex items-start text-center gap-8">
            <div
              className="flex flex-col items-center justify-center space-y-1 w-24 relative cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              onClick={() => handleCategoryClick(null)}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-800">
                  All
                </span>
              </div>
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center justify-center space-y-1 w-24 relative cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                onClick={() => handleCategoryClick(category.title)}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image
                    src={category.image_url}
                    alt={category.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-800">
                    {category.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}