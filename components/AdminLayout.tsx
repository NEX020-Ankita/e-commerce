import AdminSidebar from './AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex items-center gap-3 p-3 sm:p-4 border-b bg-white md:hidden">
            <SidebarTrigger className="h-8 w-8" />
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <div className="p-3 sm:p-4 lg:p-6 h-full">
            <div className="bg-white rounded-lg shadow-sm h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}