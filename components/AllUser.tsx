'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AllUser() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }
  
     

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">All Users</h1>
        <div className="text-sm text-gray-500">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 border rounded-lg overflow-hidden bg-white">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{user.username}</span>
                    <span className="text-xs text-gray-500 font-mono">#{user.id}</span>
                  </div>
                  <div className="text-sm text-gray-600">{user.phone}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{user.address}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white border-b">
                <TableRow>
                  <TableHead className="text-xs sm:text-sm font-semibold">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">Username</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">Phone</TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold hidden lg:table-cell">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-gray-600">{user.id}</TableCell>
                    <TableCell className="font-medium text-sm">{user.username}</TableCell>
                    <TableCell className="text-sm">{user.phone}</TableCell>
                    <TableCell className="text-sm text-gray-600 hidden lg:table-cell max-w-xs truncate">{user.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}