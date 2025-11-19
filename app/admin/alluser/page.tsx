'use client';

import AdminSidebar from "@/components/AdminSidebar";
import AllUser from "@/components/AllUser";
import AdminAuth from "@/components/AdminAuth";

export default function AllUserPage() {
  return (
    <AdminAuth>
      <div className="flex">
        <AdminSidebar />
        <div className="ml-64 flex-1">
          <AllUser />
        </div>
      </div>
    </AdminAuth>
  );
}