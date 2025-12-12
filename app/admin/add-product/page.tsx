'use client';

import { ProductCategory } from '@/components/ProductCategory';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';

export default function AddProductPage() {
  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-3xl font-bold text-center mb-10">Add Product</h1>
        <ProductCategory />
      </AdminLayout>
    </AdminAuth>
  );
}