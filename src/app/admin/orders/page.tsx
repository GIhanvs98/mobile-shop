'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  item_count: number;
}

function formatDate(dateStr: string) {
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length < 3) return String(dateStr).split('T')[0];
  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
}

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus],
    queryFn: async () => {
      const url = `/api/admin/orders?limit=50${filterStatus ? `&status=${filterStatus}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load orders');
      return res.json() as Promise<{ orders: Order[]; total: number }>;
    },
  });

  const { data: orderDetail } = useQuery({
    queryKey: ['admin-order-detail', detailId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${detailId}`);
      if (!res.ok) throw new Error('Failed to load order');
      return res.json();
    },
    enabled: detailId !== null,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Order status updated!');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order-detail', detailId] });
      setSelectedOrder(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailId(order.id);
    setNewStatus(order.status);
  };

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">{data?.total ?? 0} total orders</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filterStatus === ''
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filterStatus === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Order</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Customer</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Items</th>
                <th className="text-right px-6 py-3 font-medium text-slate-600">Total</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Date</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {order.item_count}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${parseFloat(String(order.total_amount)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={STATUS_COLORS[order.status] ?? ''}>
                        <span className="capitalize">{order.status}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button variant="outline" size="sm" onClick={() => openDetail(order)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail/Status Dialog */}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={() => {
          setSelectedOrder(null);
          setDetailId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-lg">
                    ${parseFloat(String(selectedOrder.total_amount)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method ?? '—'}</p>
                </div>
              </div>

              {/* Order items */}
              {orderDetail?.items && orderDetail.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2 border rounded-lg divide-y">
                    {orderDetail.items.map(
                      (item: {
                        id: number;
                        product_name: string;
                        quantity: number;
                        price: number;
                        image_url: string | null;
                      }) => (
                        <div key={item.id} className="flex items-center gap-3 p-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold whitespace-nowrap">
                            ${parseFloat(String(item.price)).toFixed(2)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-1.5">
                <Label>Update Status</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => updateStatus.mutate({ id: selectedOrder.id, status: newStatus })}
                  disabled={updateStatus.isPending || newStatus === selectedOrder.status}
                  className="flex-1"
                >
                  {updateStatus.isPending ? 'Updating…' : 'Update Status'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null);
                    setDetailId(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
