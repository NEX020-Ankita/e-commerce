'use client';

import { useState, useEffect } from 'react';
import { Upload, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Category {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
}

export function CategoryManagement() {
  const [formData, setFormData] = useState({
    title: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }
    
    if (!selectedFile && !editingId) {
      alert('Please select an image');
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = imagePreview;
      
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `categories${Date.now()}.${fileExt}`;
          
          console.log('Attempting to upload to category bucket:', fileName);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('category')
            .upload(fileName, selectedFile);
          
          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('category')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
            console.log('✅ Image uploaded successfully:', publicUrl);
          } else {
            console.error('❌ Storage upload failed:', uploadError);
            console.log('📝 Error details:', JSON.stringify(uploadError, null, 2));
            console.log('🔄 Using base64 fallback');
            // Keep imageUrl as base64 (imagePreview)
          }
        } catch (storageError) {
          console.error('💥 Storage exception:', storageError);
          console.log('🔄 Using base64 fallback');
          // Keep imageUrl as base64 (imagePreview)
        }
      }
      
      const categoryData = {
        title: formData.title,
        ...(imageUrl && { image_url: imageUrl })
      };
      
      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert([categoryData]);
        error = insertError;
      }
      
      if (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
      } else {
        setFormData({ title: '' });
        setSelectedFile(null);
        setImagePreview('');
        setEditingId(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving category');
    }
    
    setLoading(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      title: category.title
    });
    setImagePreview(category.image_url);
    setEditingId(category.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('Error deleting category');
    } else {
      fetchCategories();
    }
  };

  const handleCancel = () => {
    setFormData({ title: '' });
    setSelectedFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{editingId ? 'Edit Category' : 'Add Category'}</h3>
        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter category title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category Image</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : "Click to upload image"}
                  </p>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={200}
                    height={150}
                    className="w-48 h-36 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : (editingId ? "Update Category" : "Add Category")}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {categories.length > 0 && (
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">All Categories</h3>
          </div>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Image
                        src={category.image_url}
                        alt={category.title}
                        width={60}
                        height={45}
                        className="w-15 h-11 object-cover rounded border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}