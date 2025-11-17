'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-center mb-10">
        All Products
      </h1>
      <div className="container mx-auto px-4">
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available. Add products from the admin panel.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.image_url || '/lan.webp'}
                        alt={product.title}
                        width={60}
                        height={45}
                        className="w-15 h-11 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}