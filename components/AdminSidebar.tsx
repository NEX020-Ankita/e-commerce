"use client";

import { useState } from "react";

export default function AdminSidebar() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2">
          <li>
            <a
              href="/admin/alluser"
              className="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <span>All Users</span>
            </a>
          </li>

          <li>
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-800 transition-colors"
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
              <ul className="bg-gray-800 space-y-1">
                <li>
                  <a
                    href="/admin/product"
                    className="block px-12 py-2 hover:bg-gray-700 transition-colors"
                  >
                    All Products
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/add-product"
                    className="block px-12 py-2 hover:bg-gray-700 transition-colors"
                  >
                    Add Product
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/categories"
                    className="block px-12 py-2 hover:bg-gray-700 transition-colors"
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
              className="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <span>Banner</span>
            </a>
          </li>
          <li>
            <a
              href="/admin/query"
              className="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              <span>Query</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
