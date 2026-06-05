'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  order_count: number;
  total_spent: number;
}

function formatDate(dateStr: string) {
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length < 3) return String(dateStr).split('T')[0];
  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    user: User;
    newRole: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const url = `/api/admin/users?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load users');
      return res.json() as Promise<{ users: User[]; total: number }>;
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update role');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.role === 'admin' ? 'User promoted to admin!' : 'Admin role removed.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setConfirmAction(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setConfirmAction(null);
    },
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Users</h2>
          <p className="text-sm text-muted-foreground mt-1">{data?.total ?? 0} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-600">User</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Role</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Orders</th>
                <th className="text-right px-6 py-3 font-medium text-slate-600">Total Spent</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Joined</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'Customer'
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {user.order_count}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${(user.total_spent ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.role === 'admin' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => setConfirmAction({ user, newRole: 'customer' })}
                        >
                          <ShieldOff className="h-3.5 w-3.5 mr-1.5" />
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => setConfirmAction({ user, newRole: 'admin' })}
                        >
                          <Shield className="h-3.5 w-3.5 mr-1.5" />
                          Make Admin
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm role change */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.newRole === 'admin' ? 'Promote to Admin?' : 'Remove Admin Role?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.newRole === 'admin'
                ? `${confirmAction?.user?.name} will gain full access to the admin panel.`
                : `${confirmAction?.user?.name} will lose admin panel access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmAction &&
                updateRole.mutate({
                  userId: confirmAction.user.id,
                  role: confirmAction.newRole,
                })
              }
              disabled={updateRole.isPending}
            >
              {updateRole.isPending ? 'Updating…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
