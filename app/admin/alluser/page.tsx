import AdminSidebar from "@/components/AdminSidebar";
import AllUser from "@/components/AllUser";

export default function AllUserPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 flex-1">
        <AllUser />
      </div>
    </div>
  );
}