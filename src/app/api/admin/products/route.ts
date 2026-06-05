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

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Date.now()
  );
}

// GET /api/admin/products — list all products with category info and pagination
export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(p.name ILIKE $${params.length} OR p.brand ILIKE $${params.length} OR p.sku ILIKE $${params.length})`
      );
    }
    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p.category_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countParams = [...params];
    const dataParams = [...params, limit, offset];

    const [countRows, products] = await Promise.all([
      sql(
        `SELECT COUNT(*) as count FROM products p JOIN categories c ON p.category_id = c.id ${where}`,
        countParams
      ),
      sql(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         JOIN categories c ON p.category_id = c.id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        dataParams
      ),
    ]);

    return Response.json({
      products,
      total: parseInt(countRows[0]?.count || '0'),
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/products — create a new product
export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

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
      status = 'active',
    } = body;

    if (!name || !category_id || !price) {
      return Response.json({ error: 'Name, category, and price are required.' }, { status: 400 });
    }

    const slug = generateSlug(name);

    const result = await sql(
      `INSERT INTO products (name, slug, brand, sku, category_id, price, discount_price, stock, description, specifications, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name,
        slug,
        brand || null,
        sku || null,
        category_id,
        price,
        discount_price || null,
        stock || 0,
        description || null,
        specifications ? JSON.stringify(specifications) : null,
        image_url || null,
        status,
      ]
    );

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Admin products POST error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
