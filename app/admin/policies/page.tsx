'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiptapEditor } from '@/components/TiptapEditor';
import { Edit, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';

export default function PoliciesPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    fetchPolicies();
    if (editId) {
      loadPolicyForEdit(editId);
    }
  }, [editId]);

  const loadPolicyForEdit = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setEditingPolicy(data);
        setTitle(data.title);
        setDescription(data.content);
      }
    } catch (error) {
      console.error('Error loading policy:', error);
    }
  };

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingPolicy) {
        const { error } = await supabase
          .from('policies')
          .update({ title, content: description })
          .eq('id', editingPolicy.id);
        
        if (error) throw error;
        alert('Policy updated successfully!');
      } else {
        const { error } = await supabase
          .from('policies')
          .insert({
            title,
            content: description,
            type: 'refund',
            product_id: null
          });
        
        if (error) throw error;
        alert('Policy created successfully!');
      }
      
      setTitle('');
      setDescription('');
      setEditingPolicy(null);
      fetchPolicies();
      window.location.href = '/admin/policy-manage';
    } catch (error) {
      console.error('Error saving policy:', error);
      alert('Error saving policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy);
    setTitle(policy.title);
    setDescription(policy.content);
    setIsPreview(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const handleCancel = () => {
    setEditingPolicy(null);
    setTitle('');
    setDescription('');
    setIsPreview(false);
  };

  return (
    <AdminAuth>
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingPolicy ? 'Edit Policy' : 'Create Policy'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className='h-96 w-full'>
                  <Label htmlFor="description">Description</Label>
                  {isPreview ? (
                    <div className="border rounded-md p-4 h-80 overflow-y-auto bg-gray-50">
                      <div dangerouslySetInnerHTML={{ __html: description }} />
                    </div>
                  ) : (
                    <div className="h-80 overflow-y-auto border rounded-md">
                      <TiptapEditor
                        content={description}
                        onChange={setDescription}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-8 flex gap-4">
                  <Button
                    type="button" 
                    onClick={() => window.location.href = '/admin/policy-manage'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Preview
                  </Button>
                  {editingPolicy && (
                    <Button 
                      type="button" 
                      onClick={handleCancel}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isLoading ? (editingPolicy ? 'Updating...' : 'Creating...') : (editingPolicy ? 'Update Policy' : 'Create Policy')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminAuth>
  );
}