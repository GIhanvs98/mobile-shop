'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Package, Tags, ShoppingBag, Users, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatDate(dateStr: string) {
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length < 3) return String(dateStr).split('T')[0];
  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <p className="text-red-500 font-medium">Failed to load dashboard data.</p>
        <p className="text-sm text-muted-foreground">Make sure you have admin access.</p>
      </div>
    );
  }

  const stats = data?.stats;
  const monthlySales = data?.monthlySales ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const ordersByStatus = (data?.ordersByStatus ?? []).map(
    (s: { status: string; count: number }) => ({
      name: STATUS_LABELS[s.status] ?? s.status,
      value: s.count,
      color: STATUS_COLORS[s.status] ?? '#94a3b8',
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here's your store overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={`$${(stats?.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              color="bg-green-500"
              subtitle="From all completed orders"
            />
            <StatCard
              title="Total Orders"
              value={stats?.orders ?? 0}
              icon={ShoppingBag}
              color="bg-blue-500"
              subtitle={`${stats?.pendingOrders ?? 0} pending`}
            />
            <StatCard
              title="Total Products"
              value={stats?.products ?? 0}
              icon={Package}
              color="bg-purple-500"
              subtitle="In your catalog"
            />
            <StatCard
              title="Categories"
              value={stats?.categories ?? 0}
              icon={Tags}
              color="bg-orange-500"
              subtitle="Product categories"
            />
            <StatCard
              title="Customers"
              value={stats?.users ?? 0}
              icon={Users}
              color="bg-pink-500"
              subtitle="Registered users"
            />
            <StatCard
              title="Pending Orders"
              value={stats?.pendingOrders ?? 0}
              icon={Clock}
              color="bg-yellow-500"
              subtitle="Awaiting action"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : monthlySales.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlySales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : ordersByStatus.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry: { color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Order</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Date</th>
                    <th className="text-right px-6 py-3 font-medium text-slate-600">Amount</th>
                    <th className="text-center px-6 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map(
                    (order: {
                      id: number;
                      customer_name: string;
                      customer_email: string;
                      created_at: string;
                      total_amount: number;
                      status: string;
                    }) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          ${parseFloat(String(order.total_amount)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            style={{
                              backgroundColor: `${STATUS_COLORS[order.status]}20`,
                              color: STATUS_COLORS[order.status],
                              border: `1px solid ${STATUS_COLORS[order.status]}40`,
                            }}
                          >
                            {STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
