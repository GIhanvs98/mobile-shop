import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const users = await sql(`SELECT role FROM "user" WHERE id = $1`, [session.user.id]);
  if (users?.[0]?.role !== 'admin') return null;
  return session;
}

// PUT /api/admin/categories/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, description, image_url, status } = body;

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      values.push(name);
      setClauses.push(`name = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description);
      setClauses.push(`description = $${values.length}`);
    }
    if (image_url !== undefined) {
      values.push(image_url);
      setClauses.push(`image_url = $${values.length}`);
    }
    if (status !== undefined) {
      values.push(status);
      setClauses.push(`status = $${values.length}`);
    }

    if (!setClauses.length) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const result = await sql(
      `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!result.length) return Response.json({ error: 'Category not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    console.error('Admin category PUT error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Check if category has products
    const productCheck = await sql(
      `SELECT COUNT(*) as count FROM products WHERE category_id = $1`,
      [id]
    );
    if (parseInt(productCheck[0]?.count) > 0) {
      return Response.json(
        { error: 'Cannot delete a category that has products. Reassign products first.' },
        { status: 400 }
      );
    }

    const result = await sql(`DELETE FROM categories WHERE id = $1 RETURNING id`, [id]);
    if (!result.length) return Response.json({ error: 'Category not found' }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin category DELETE error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
