'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface Product {
  id: number;
  name: string;
  brand: string;
  sku: string;
  price: number;
  discount_price: number | null;
  stock: number;
  status: string;
  image_url: string | null;
  category_name: string;
  created_at: string;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stock < 5)
    return <Badge className="bg-red-100 text-red-700 border-red-200">{stock} left</Badge>;
  if (stock < 20)
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{stock} low</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200">{stock} in stock</Badge>;
}

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      const url = `/api/admin/products?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load products');
      return res.json() as Promise<{ products: Product[]; total: number }>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }
    },
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteId(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setDeleteId(null);
    },
  });

  const products = data?.products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.total ?? 0} products in your catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products…"
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
                <th className="text-left px-6 py-3 font-medium text-slate-600">Product</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Category</th>
                <th className="text-right px-6 py-3 font-medium text-slate-600">Price</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Stock</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No products found</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/admin/products/new">Add your first product</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.brand ?? '—'} {product.sku ? `· ${product.sku}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.category_name}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold">
                        ${parseFloat(String(product.price)).toFixed(2)}
                      </p>
                      {product.discount_price && (
                        <p className="text-xs text-green-600">
                          Sale: ${parseFloat(String(product.discount_price)).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }
                      >
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your
              catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
