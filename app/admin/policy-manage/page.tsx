'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, FileText, Calendar, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';

export default function PolicyManagePage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPolicy, setPreviewPolicy] = useState<any>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

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
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <AdminAuth>
        <AdminLayout>
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading policies...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Policy Management</h1>
                  <p className="text-gray-600 text-lg">Manage and organize your policies efficiently</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/admin/policies'}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Policy
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-200 to-blue-200 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Policies</p>
                      <p className="text-3xl font-bold">{policies.length}</p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-200 to-blue-200 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Refund Policies</p>
                      <p className="text-3xl font-bold">{policies.filter(p => p.type === 'refund').length}</p>
                    </div>
                    <FileText className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-sky-200 to-sky-100 text-white border-0 ">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Privacy Policies</p>
                      <p className="text-3xl font-bold">{policies.filter(p => p.type === 'privacy').length}</p>
                    </div>
                    <FileText className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div> */}

            {/* Policies Grid */}
            <div className="grid gap-6">
              {policies.map((policy) => (
                <Card key={policy.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">{policy.title}</CardTitle>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge 
                              variant={policy.type === 'refund' ? 'default' : 'secondary'}
                              className={`${policy.type === 'refund' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} font-medium`}
                            >
                              {policy.type === 'refund' ? 'Refund Policy' : 'Privacy Policy'}
                            </Badge>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(policy.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setPreviewPolicy(policy)}
                          className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = `/admin/policies?edit=${policy.id}`} 
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(policy.id)}
                          className="bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-gray-600 leading-relaxed">
                      <div 
                        className="line-clamp-3 prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: policy.content }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {policies.length === 0 && (
                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No policies created yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first policy</p>
                    <Button 
                      onClick={() => window.location.href = '/admin/policies'}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Policy
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Preview Dialog */}
          <Dialog open={!!previewPolicy} onOpenChange={() => setPreviewPolicy(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold text-gray-900">{previewPolicy?.title}</DialogTitle>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge 
                    variant={previewPolicy?.type === 'refund' ? 'default' : 'secondary'}
                    className={`${previewPolicy?.type === 'refund' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} font-medium`}
                  >
                    {previewPolicy?.type === 'refund' ? 'Refund Policy' : 'Privacy Policy'}
                  </Badge>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {previewPolicy && new Date(previewPolicy.created_at).toLocaleDateString()}
                  </div>
                </div>
              </DialogHeader>
              <div className="pt-6">
                <div 
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: previewPolicy?.content }} 
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AdminAuth>
  );
}