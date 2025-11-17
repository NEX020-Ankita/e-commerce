import { ProductCategory } from '@/components/ProductCategory';
import AdminLayout from '@/components/AdminLayout';

export default function ProductCategoryPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <ProductCategory />
    </AdminLayout>
  );
}