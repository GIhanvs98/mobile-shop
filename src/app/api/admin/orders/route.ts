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

// GET /api/admin/orders — paginated order list with customer info
export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countParams = [...params];
    const dataParams = [...params, limit, offset];

    const [countRows, orders] = await Promise.all([
      sql(`SELECT COUNT(*) as count FROM orders o ${where}`, countParams),
      sql(
        `SELECT o.id, o.total_amount, o.status, o.payment_method, o.created_at,
                u.name as customer_name, u.email as customer_email,
                COUNT(oi.id)::int as item_count
         FROM orders o
         JOIN "user" u ON o.user_id = u.id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         ${where}
         GROUP BY o.id, u.name, u.email
         ORDER BY o.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        dataParams
      ),
    ]);

    return Response.json({
      orders,
      total: parseInt(countRows[0]?.count || '0'),
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
