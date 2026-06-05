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

// GET /api/admin/products/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const rows = await sql(
      `SELECT p.*, c.name as category_name FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (!rows.length) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json(rows[0]);
  } catch (error) {
    console.error('Admin product GET error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/products/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      brand,
      sku,
      category_id,
      price,
      discount_price,
      stock,
      description,
      specifications,
      image_url,
      status,
    } = body;

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      values.push(name);
      setClauses.push(`name = $${values.length}`);
    }
    if (brand !== undefined) {
      values.push(brand);
      setClauses.push(`brand = $${values.length}`);
    }
    if (sku !== undefined) {
      values.push(sku);
      setClauses.push(`sku = $${values.length}`);
    }
    if (category_id !== undefined) {
      values.push(category_id);
      setClauses.push(`category_id = $${values.length}`);
    }
    if (price !== undefined) {
      values.push(price);
      setClauses.push(`price = $${values.length}`);
    }
    if (discount_price !== undefined) {
      values.push(discount_price || null);
      setClauses.push(`discount_price = $${values.length}`);
    }
    if (stock !== undefined) {
      values.push(stock);
      setClauses.push(`stock = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description);
      setClauses.push(`description = $${values.length}`);
    }
    if (specifications !== undefined) {
      values.push(specifications ? JSON.stringify(specifications) : null);
      setClauses.push(`specifications = $${values.length}`);
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
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!result.length) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    console.error('Admin product PUT error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const result = await sql(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);

    if (!result.length) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin product DELETE error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
