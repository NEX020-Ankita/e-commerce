'use client';

import { BannerPage } from "@/components/BannerPage";
import AdminLayout from "@/components/AdminLayout";
import AdminAuth from "@/components/AdminAuth";

export default function BannerPageWithSidebar() {
  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-3xl font-bold mb-6">Banner Management</h1>
        <BannerPage />
      </AdminLayout>
    </AdminAuth>
  );
}