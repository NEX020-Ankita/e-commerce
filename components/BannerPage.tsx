'use client';

import { useState, useEffect } from 'react';
import { Upload, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Banner {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export function BannerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);


  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching banners:', error);
      } else {
        setBanners(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  
  useEffect(() => {
    fetchBanners();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !editingId) {
      alert('Please select an image');
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = imagePreview;
      
      // Try to upload to Supabase Storage first
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `banner_${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('banner-images')
            .upload(fileName, selectedFile);
          
          if (!uploadError) {
            // Get public URL for the uploaded image
            const { data: { publicUrl } } = supabase.storage
              .from('banner-images')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
          }
        } catch (storageError) {
          console.log('Storage not available, using base64 fallback');
        }
      }
      
      // Save or update banner data
      const bannerData = {
        title: formData.title,
        description: formData.description,
        ...(imageUrl && { image_url: imageUrl }),
        ...(editingId ? {} : { created_at: new Date().toISOString() })
      };
      
      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('banner')
          .update(bannerData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('banner')
          .insert([bannerData]);
        error = insertError;
      }
      
      if (error) {
        console.error('Error saving banner:', error);
        alert('Error saving banner');
      } else {
        setFormData({ title: '', description: '', image: '' });
        setSelectedFile(null);
        setImagePreview('');
        setEditingId(null);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving banner');
    }
    
    setLoading(false);
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      image: ''
    });
    setImagePreview(banner.image_url);
    setEditingId(banner.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    const { error } = await supabase
      .from('banner')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('Error deleting banner');
    } else {
      fetchBanners();
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', image: '' });
    setSelectedFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  return (
    <div className=" w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Banner' : 'Add Banner'}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Grid - Title and Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter banner description"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Right Grid - Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 transition-colors h-32">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "Click to upload image"}
                  </p>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : (editingId ? "Update Banner" : "Add Banner")}
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

      {/* Banners Table */}
      {banners.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg border mt-6">
          <h3 className="text-xl font-semibold mb-4">All Banners</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Image</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{banner.title}</td>
                    <td className="border border-gray-300 px-4 py-2">{banner.description}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {banner.image_url && (
                        <Image
                          src={banner.image_url}
                          alt={banner.title}
                          width={80}
                          height={60}
                          className="w-20 h-15 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {new Date(banner.created_at).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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