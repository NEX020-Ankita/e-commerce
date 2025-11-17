import { ProductCategory } from '@/components/ProductCategory';
import AdminLayout from '@/components/AdminLayout';

export default function AddProductPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <ProductCategory />
    </AdminLayout>
  );
}