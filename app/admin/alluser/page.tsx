"use client";

import AllUser from "@/components/AllUser";
import AdminAuth from "@/components/AdminAuth";
import AdminLayout from "@/components/AdminLayout";

export default function AllUserPage() {
  return (
    <AdminAuth>
      <AdminLayout>
        <AllUser />
      </AdminLayout>
    </AdminAuth>
  );
}
