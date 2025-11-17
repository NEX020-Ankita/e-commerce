import { BannerPage } from "@/components/BannerPage";
import AdminLayout from "@/components/AdminLayout";

export default function BannerPageWithSidebar() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Banner Management</h1>
      <BannerPage />
    </AdminLayout>
  );
}