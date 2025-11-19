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
                            product.image_urls
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Product
                </h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Title
                    </label>
                    <Input
                      value={editForm.title || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                      placeholder="Enter product title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      className="w-full h-20 p-3 border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none focus:outline-none"
                      placeholder="Enter product description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <Input
                        value={editForm.category || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                        placeholder="Category"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (₹)
                      </label>
                      <Input
                        type="number"
                        value={editForm.price || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: Number(e.target.value),
                          })
                        }
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Images
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="flex gap-3 items-center mb-3">
                        {selectedProduct?.image_urls &&
                        selectedProduct.image_urls.length > 1 ? (
                          selectedProduct.image_urls.map((url, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={url}
                                alt={`Current ${index + 1}`}
                                width={60}
                                height={60}
                                className="w-15 h-15 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                              />
                              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {index + 1}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="relative">
                            <Image
                              src={
                                selectedProduct?.image_urls && selectedProduct.image_urls[0]
                                  ? selectedProduct.image_urls[0]
                                  : "/lan.webp"
                              }
                              alt="Current"
                              width={60}
                              height={60}
                              className="w-15 h-15 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            />
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              ✓
                            </span>
                          </div>
                        )}
                        {imagePreview &&
                          imagePreview !== (selectedProduct?.image_urls?.[0] || '') && (
                            <div className="relative">
                              <Image
                                src={imagePreview}
                                alt="New"
                                width={60}
                                height={60}
                                className="w-15 h-15 object-cover rounded-lg border-2 border-blue-400 shadow-sm"
                              />
                              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                N
                              </span>
                            </div>
                          )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={handleEditCancel}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg"
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
