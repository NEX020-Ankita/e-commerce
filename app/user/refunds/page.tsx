"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";

interface RefundRequest {
  id: number;
  order_id: number;
  reason: string;
  amount: number;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export default function UserRefundsPage() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching refund requests:', error);
      } else {
        setRefundRequests(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      processed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (showRequestForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowRequestForm(false)}
            className="mb-4"
          >
            ← Back to Refunds
          </Button>
        </div>
        <div className="p-6 border rounded-lg">
          <p className="text-gray-600">Refund request form is currently unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Refunds & Returns</h1>
          <p className="text-gray-600">Manage your refund requests and view our return policy</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Refund Requests</span>
                <Badge variant="secondary">{refundRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : refundRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No refund requests found</p>
                  <Button onClick={() => setShowRequestForm(true)} variant="outline">
                    Create Your First Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {refundRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">Order #{request.order_id}</span>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Reason:</span>
                          <p className="font-medium">{request.reason}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium text-green-600">₹{request.amount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Requested:</span>
                          <p className="font-medium">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {request.processed_at && (
                          <div>
                            <span className="text-gray-500">Processed:</span>
                            <p className="font-medium">
                              {new Date(request.processed_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {request.admin_notes && (
                        <>
                          <Separator className="my-3" />
                          <div>
                            <span className="text-gray-500 text-sm">Admin Notes:</span>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                              {request.admin_notes}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Refund Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our refund policy information will be displayed here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}