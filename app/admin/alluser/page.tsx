'use client';

import AdminSidebar from "@/components/AdminSidebar";
import AllUser from "@/components/AllUser";
import AdminAuth from "@/components/AdminAuth";

export default function AllUserPage() {
  return (
    <AdminAuth>
      <div className="flex">
        <AdminSidebar />
        <div className="">
          <AllUser />
        </div>
      </div>
    </AdminAuth>
  );
}