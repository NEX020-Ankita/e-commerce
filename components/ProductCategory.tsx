'use client';

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_urls?: string[];
  created_at: string;
}

interface Category {
  id: number;
  title: string;
  image_urls: string;
  created_at: string;
}

export function ProductCategory() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching product:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      
      const previews: string[] = [];
      let loadedCount = 0;
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = () => {
          previews[index] = reader.result as string;
          loadedCount++;
          if (loadedCount === files.length) {
            setImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      alert('Please fill all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrls: string[] = imagePreviews;
      
      // Try to upload to Supabase Storage first
      if (selectedFiles.length > 0) {
        const uploadedUrls: string[] = [];
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `product_image${Date.now()}_${i}.${fileExt}`;
            
            console.log('🔄 Attempting to upload product image:', fileName);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('product-image')
              .upload(fileName, file);
            
            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('product-image')
                .getPublicUrl(fileName);
              uploadedUrls.push(publicUrl);
              console.log('✅ Product image uploaded successfully:', publicUrl);
            } else {
              console.error('❌ Storage upload failed:', uploadError);
              uploadedUrls.push(imagePreviews[i]);
            }
          } catch (storageError) {
            console.error('💥 Storage exception:', storageError);
            uploadedUrls.push(imagePreviews[i]);
          }
        }
        imageUrls = uploadedUrls;
      }
      
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        ...(imageUrls.length > 0 && { 
          image_urls: imageUrls
        })
      };
      
      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('product')
          .update(productData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('product')
          .insert([productData]);
        error = insertError;
      }
      
      if (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
      } else {
        setFormData({ title: '', description: '', price: '', category: '' });
        setSelectedFiles([]);
        setImagePreviews([]);
        setEditingId(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving product');
    }
    
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category
    });
    const urls = Array.isArray(product.image_urls) ? product.image_urls : [];
    setImagePreviews(urls.filter(Boolean));
    setEditingId(product.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    console.log('🗑️ Attempting to delete product with ID:', id);
    
    try {
      // Optimistically update UI first
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      const { error } = await supabase
        .from('product')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Delete failed:', error);
        console.log('📝 Error details:', JSON.stringify(error, null, 2));
        alert(`Error deleting product: ${error.message}`);
        // Revert optimistic update on error
        fetchProducts();
      } else {
        console.log('✅ Product deleted successfully');
        // Force refresh to ensure consistency
        setTimeout(() => {
          fetchProducts();
        }, 100);
      }
    } catch (exception) {
      console.error('💥 Delete exception:', exception);
      alert('Error deleting product');
      // Revert optimistic update on exception
      fetchProducts();
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', price: '', category: '' });
    setSelectedFiles([]);
    setImagePreviews([]);
    setEditingId(null);
  };

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter product title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter product price"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          

          <div>
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} images selected` : "Click to upload images"}
                </p>
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <Image
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={150}
                    height={100}
                    className="w-24 h-24 object-cover rounded-lg shadow-lg"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : (editingId ? "Update Product" : "Add Product")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      {products.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg border mt-6">
          <h3 className="text-xl font-semibold mb-4">All Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Image</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.image_urls && product.image_urls.length > 0 && (
                        <Image
                          src={product.image_urls[0]}
                          alt={product.title}
                          width={60}
                          height={45}
                          className="w-15 h-11 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{product.title}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.description}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.category}</td>
                    <td className="border border-gray-300 px-4 py-2">₹{product.price}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}