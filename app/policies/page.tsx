'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Calendar, Shield, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-xl font-medium">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header Section */}
       

        {/* Policies Section */}
        <div className="space-y-8">
          {policies.length > 0 ? (
            policies.map((policy, index) => (
              <Card key={policy.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        policy.type === 'refund' 
                          ? 'bg-green-100' 
                          : 'bg-purple-100'
                      }`}>
                        {policy.type === 'refund' ? (
                          <RefreshCw className={`h-6 w-6 ${
                            policy.type === 'refund' ? 'text-green-600' : 'text-purple-600'
                          }`} />
                        ) : (
                          <Shield className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{policy.title}</CardTitle>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={policy.type === 'refund' ? 'default' : 'secondary'}
                            className={`${
                              policy.type === 'refund' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            } font-medium px-3 py-1`}
                          >
                            {policy.type === 'refund' ? 'Refund Policy' : 'Privacy Policy'}
                          </Badge>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(policy.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium">Policy #{index + 1}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div 
                    className="text-gray-700 prose prose-lg max-w-none leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: policy.content }} 
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No policies available</h3>
                <p className="text-gray-600 text-lg">Check back later for updated policies and terms</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600">
              Last updated: {policies.length > 0 ? new Date(Math.max(...policies.map(p => new Date(p.created_at).getTime()))).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}