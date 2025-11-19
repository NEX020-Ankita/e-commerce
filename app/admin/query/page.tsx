'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import AdminAuth from '@/components/AdminAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Contact {
  id: number;
  name: string;
  message: string;
  date: string;
  created_at: string;
}

export default function QueryPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contacts:', error);
      } else {
        setContacts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this query?')) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting contact:', error);
      } else {
        setContacts(contacts.filter(contact => contact.id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <AdminAuth>
        <AdminLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading queries...</div>
          </div>
        </AdminLayout>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <AdminLayout>
        <h1 className="text-3xl font-bold text-center mb-10">
          Customer Queries
        </h1>
        <div className="container mx-auto px-4">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No queries available.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Preferred Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                      <TableCell>{new Date(contact.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert(`Edit contact: ${contact.name}`)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            style={{padding: '4px 12px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px'}}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(contact.id)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            style={{padding: '4px 12px', fontSize: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '4px', border: 'none'}}
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
      </AdminLayout>
    </AdminAuth>
    
  );
}