'use client';

import { ProductCategory } from '@/components/ProductCategory';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';

export default function ProductCategoryPage() {
  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <ProductCategory />
      </AdminLayout>
    </AdminAuth>
  );
}