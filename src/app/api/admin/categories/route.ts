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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/admin/categories — all categories with product count
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const categories = await sql(`
      SELECT c.*, COUNT(p.id)::int as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return Response.json(categories);
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/categories — create a new category
export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, image_url, status = 'active' } = body;

    if (!name) return Response.json({ error: 'Category name is required.' }, { status: 400 });

    const slug = generateSlug(name);

    // Check for existing slug
    const existing = await sql(`SELECT id FROM categories WHERE slug = $1`, [slug]);
    const finalSlug = existing.length > 0 ? `${slug}-${Date.now()}` : slug;

    const result = await sql(
      `INSERT INTO categories (name, slug, description, image_url, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, finalSlug, description || null, image_url || null, status]
    );

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Admin categories POST error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
