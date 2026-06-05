'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tags, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  product_count: number;
}

const emptyForm = { name: '', description: '', image_url: '', status: 'active' };

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      return res.json();
    },
  });

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      image_url: cat.image_url ?? '',
      status: cat.status,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Update failed');
        }
        return res.json();
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Create failed');
        }
        return res.json();
      }
    },
    onSuccess: () => {
      toast.success(editingCategory ? 'Category updated!' : 'Category created!');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }
    },
    onSuccess: () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setDeleteId(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setDeleteId(null);
    },
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Slug</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Products</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Status</th>
                <th className="text-center px-6 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Tags className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No categories yet</p>
                    <Button onClick={openCreate} variant="outline" className="mt-4">
                      Add your first category
                    </Button>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-9 h-9 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Tags className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{cat.name}</p>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">{cat.product_count} products</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={
                          cat.status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }
                      >
                        {cat.status === 'active' ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(cat.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Smartphones"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Brief description…"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-img">Image URL</Label>
              <Input
                id="cat-img"
                type="url"
                value={form.image_url}
                onChange={(e) => set('image_url', e.target.value)}
                placeholder="https://example.com/category.jpg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-status">Status</Label>
              <select
                id="cat-status"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                {saveMutation.isPending
                  ? 'Saving…'
                  : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Categories with products cannot be deleted. Reassign all products first.
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
