'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Category {
  id: number;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    brand: '',
    sku: '',
    category_id: '',
    price: '',
    discount_price: '',
    stock: '0',
    description: '',
    specifications: '',
    image_url: '',
    status: 'active',
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories-select'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let specifications = null;
      if (form.specifications.trim()) {
        try {
          specifications = JSON.parse(form.specifications);
        } catch {
          specifications = form.specifications;
        }
      }
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: parseInt(form.category_id),
          price: parseFloat(form.price),
          discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
          stock: parseInt(form.stock),
          specifications,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Product created successfully!');
      router.push('/admin/products');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category_id || !form.price) {
      toast.error('Name, category, and price are required.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
          <p className="text-sm text-muted-foreground">Fill in the details to add a product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. iPhone 15 Pro"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => set('brand', e.target.value)}
                  placeholder="e.g. Apple"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  placeholder="e.g. IPH-15-PRO-128"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category_id">Category *</Label>
                <select
                  id="category_id"
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Write a detailed product description…"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount_price">Sale Price ($)</Label>
                <Input
                  id="discount_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_price}
                  onChange={(e) => set('discount_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media & Specs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Media & Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="image_url">Product Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={form.image_url}
                onChange={(e) => set('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {form.image_url && (
                <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border bg-slate-50">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specifications">Specifications (JSON)</Label>
              <Textarea
                id="specifications"
                value={form.specifications}
                onChange={(e) => set('specifications', e.target.value)}
                placeholder={'{\n  "Display": "6.1-inch Super Retina XDR",\n  "Chip": "A17 Pro"\n}'}
                rows={5}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Enter JSON key-value pairs for specs</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active (visible in store)</option>
                <option value="inactive">Inactive (hidden from store)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={mutation.isPending} className="min-w-32">
            <Save className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Saving…' : 'Save Product'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
