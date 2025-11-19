'use client';

import { CategoryManagement } from '@/components/CategoryManagement';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';

export default function CategoryPage() {
  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Category Management</h1>
        <CategoryManagement />
      </AdminLayout>
    </AdminAuth>
  );
}