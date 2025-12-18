'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
    return <div className="h-screen w-full flex items-center justify-center">Loading users...</div>;
  }
  
     

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 lg:p-6">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">All Users</h1>
      <div className="flex-1 border rounded-lg overflow-hidden">
        <div className="h-full w-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="text-xs sm:text-sm">ID</TableHead>
                <TableHead className="text-xs sm:text-sm">Username</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Phone</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">{user.username}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{user.phone}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{user.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}