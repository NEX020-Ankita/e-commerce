"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronRight, Users, Package, Image, ShoppingCart, MessageSquare, BarChart3, RefreshCw, FileText } from "lucide-react";

export default function AdminSidebar() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sidebar className="border-r w-64 sticky top-0 h-screen">
      <SidebarContent className="p-4 h-full overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-2 py-2">Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/alluser'} className="w-full justify-start px-3 py-2 text-sm">
                  <a href="/admin/alluser" className="flex items-center gap-3">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">All Users</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsProductsOpen(!isProductsOpen)} className="w-full justify-start px-3 py-2 text-sm">
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Products</span>
                  <ChevronRight className={`ml-auto h-4 w-4 flex-shrink-0 transition-transform ${isProductsOpen ? 'rotate-90' : ''}`} />
                </SidebarMenuButton>
                {isProductsOpen && (
                  <SidebarMenu className="ml-4 mt-1 space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/product'} size="sm" className="w-full justify-start px-3 py-1.5 text-xs">
                        <a href="/admin/product" className="truncate">All Products</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/add-product'} size="sm" className="w-full justify-start px-3 py-1.5 text-xs">
                        <a href="/admin/add-product" className="truncate">Add Product</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/categories'} size="sm" className="w-full justify-start px-3 py-1.5 text-xs">
                        <a href="/admin/categories" className="truncate">Categories</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/banner'} className="w-full justify-start px-3 py-2 text-sm">
                  <a href="/admin/banner" className="flex items-center gap-3">
                    <Image className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Banner</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/orders'} className="w-full justify-start px-3 py-2 text-sm">
                  <a href="/admin/orders" className="flex items-center gap-3">
                    <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Orders</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/policies'} className="w-full justify-start px-3 py-2 text-sm">
                  <a href="/admin/policies" className="flex items-center gap-3">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Policies</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/query'} className="w-full justify-start px-3 py-2 text-sm">
                  <a href="/admin/query" className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Contacts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
