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
import { ChevronRight, Users, Package, Image, ShoppingCart, MessageSquare } from "lucide-react";

export default function AdminSidebar() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/alluser'}>
                  <a href="/admin/alluser">
                    <Users className="h-4 w-4" />
                    <span>All Users</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsProductsOpen(!isProductsOpen)}>
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                  <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-90' : ''}`} />
                </SidebarMenuButton>
                {isProductsOpen && (
                  <SidebarMenu className="ml-4 mt-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/product'} size="sm">
                        <a href="/admin/product">All Products</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/add-product'} size="sm">
                        <a href="/admin/add-product">Add Product</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/categories'} size="sm">
                        <a href="/admin/categories">Categories</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/banner'}>
                  <a href="/admin/banner">
                    <Image className="h-4 w-4" />
                    <span>Banner</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/orders'}>
                  <a href="/admin/orders">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Orders</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/query'}>
                  <a href="/admin/query">
                    <MessageSquare className="h-4 w-4" />
                    <span>Contacts</span>
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
