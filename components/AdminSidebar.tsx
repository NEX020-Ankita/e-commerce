"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white text-black min-h-screen flex-shrink-0 overflow-y-auto border-r border-gray-200 shadow-lg">
    
  

      <nav className="mt-6">
        <ul className="space-y-2">
          <li>
            <a
              href="/admin/alluser"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                pathname === '/admin/alluser' ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <span>All Users</span>
            </a>
          </li>

          <li>
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-100 transition-colors"
            >
              <span>Products</span>
              <span
                className={`transform transition-transform ${
                  isProductsOpen ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>

            {isProductsOpen && (
              <ul className="bg-gray-50 space-y-1">
                <li>
                  <a
                    href="/admin/product"
                    className={`block px-12 py-2 hover:bg-gray-200 transition-colors ${
                      pathname === '/admin/product' ? 'bg-blue-100 text-blue-600' : ''
                    }`}
                  >
                    All Products
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/add-product"
                    className={`block px-12 py-2 hover:bg-gray-200 transition-colors ${
                      pathname === '/admin/add-product' ? 'bg-blue-100 text-blue-600' : ''
                    }`}
                  >
                    Add Product
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/categories"
                    className={`block px-12 py-2 hover:bg-gray-200 transition-colors ${
                      pathname === '/admin/categories' ? 'bg-blue-100 text-blue-600' : ''
                    }`}
                  >
                    Categories
                  </a>
                </li>
              </ul>
            )}
          </li>
          <li>
            <a
              href="/admin/banner"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                pathname === '/admin/banner' ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <span>Banner</span>
            </a>
          </li>
          <li>
            <a
              href="/admin/orders"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                pathname === '/admin/orders' ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <span>Orders</span>
            </a>
          </li>
          <li>
            <a
              href="/admin/query"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                pathname === '/admin/query' ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <span>Contacts</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
