"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/AdminLayout";
import AdminAuth from "@/components/AdminAuth";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TiptapEditor } from "@/components/TiptapEditor";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_urls?: string[];
  created_at: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm(product);
    setImageFile(null);
    setImagePreview(product.image_urls?.[0] || "");
    setEditDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-image")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from("product-image")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!selectedProduct || !editForm) return;

    try {
      let imageUrls = editForm.image_urls || [];

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrls = [uploadedUrl];
        }
      }

      const { data, error } = await supabase
        .from("product")
        .update({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          category: editForm.category,
          image_urls: imageUrls,
        })
        .eq("id", selectedProduct.id)
        .select();

      if (error) {
        console.error("Error updating product:", error);
        return;
      }

      // Update local state immediately
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === selectedProduct.id
            ? { ...product, ...editForm, image_urls: imageUrls }
            : product
        )
      );

      // Close modal and reset form
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setEditForm({});
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
    setEditForm({});
    setImageFile(null);
    setImagePreview("");
  };

  const handleDeleteClick = (product: Product) => {
    console.log("Delete button clicked for product:", product);
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) {
      alert("No product selected");
      return;
    }

    console.log("Starting delete for product ID:", selectedProduct.id);

    try {
      // First, let's check if the product exists
      const { data: checkData, error: checkError } = await supabase
        .from("product")
        .select("id")
        .eq("id", selectedProduct.id)
        .single();

      if (checkError) {
        console.error("Product not found:", checkError);
        alert("Product not found in database");
        return;
      }

      console.log("Product exists, proceeding with delete...");

      // Now delete the product
      const { error } = await supabase
        .from("product")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) {
        console.error("Delete error:", error);
        alert("Delete failed: " + error.message);
        return;
      }

      console.log("Delete successful, updating UI...");

      // Remove from local state
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== selectedProduct.id)
      );

      // Close modal
      setDeleteDialogOpen(false);
      setSelectedProduct(null);

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Unexpected error: " + (error as Error).message);
    }
  };

  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-3xl font-bold text-center mb-10">All Products</h1>
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products available. Add products from the admin pannel.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <TableRow className="border-b-2 border-blue-200">
                    <TableHead className="font-semibold text-gray-700 py-4">Image</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Price</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="cursor-pointer"
                      >
                        <Image
                          src={
                            Array.isArray(product.image_urls) && product.image_urls.length > 0
                              ? product.image_urls[0]
                              : "/lan.webp"
                          }
                          alt={product.title}
                          width={60}
                          height={45}
                          className="w-15 h-11 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.title}
                      </TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex gap-2"
                          style={{ display: "flex", gap: "8px" }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "Edit clicked for product:",
                                product.id
                              );
                              handleEdit(product);
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            style={{
                              padding: "4px 12px",
                              fontSize: "14px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Delete ${product.title}?`)) {
                                try {
                                  const { error } = await supabase
                                    .from("product")
                                    .delete()
                                    .eq("id", product.id);

                                  if (error) {
                                    alert("Error: " + error.message);
                                  } else {
                                    setProducts(
                                      products.filter(
                                        (p) => p.id !== product.id
                                      )
                                    );
                                    alert("Deleted successfully!");
                                  }
                                } catch (err) {
                                  alert("Delete failed");
                                }
                              }
                            }}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            style={{
                              padding: "4px 12px",
                              fontSize: "14px",
                              backgroundColor: "#dc2626",
                              color: "white",
                              borderRadius: "4px",
                              border: "none",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                  <p className="text-sm text-gray-500 mt-1">Update the details for the selected product.</p>
                </div>
                <button 
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Form Fields */}
                <div className="md:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Product Title
                    </label>
                    <Input
                      value={editForm.title || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Premium Wireless Headphones"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Description
                    </label>
                    <TiptapEditor
                      content={editForm.description || ""}
                      onChange={(content) =>
                        setEditForm({ ...editForm, description: content })
                      }
                      placeholder="Product description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <Input
                          value={editForm.category || ""}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <Input
                          type="number"
                          value={editForm.price || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: Number(e.target.value),
                            })
                          }
                          className="w-full p-2.5 pl-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Image Upload */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Product Image
                  </label>
                  
                  <div className="bg-[#1a1a1a] rounded-xl aspect-square flex items-center justify-center overflow-hidden relative group shadow-inner border border-gray-200">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={300}
                        height={300}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="text-gray-500 text-sm">No image</div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center justify-center w-full px-4 py-2.5 bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={handleEditCancel}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Confirm Deletion
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete "{selectedProduct?.title}"?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    This action cannot be undone. The product will be permanently removed from your inventory.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Warning</p>
                      <p className="text-sm text-red-700">This will permanently delete the product and all associated data.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminAuth>
  );
}
