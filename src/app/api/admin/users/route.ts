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

// GET /api/admin/users — all users with order count
export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countParams = [...params];
    const dataParams = [...params, limit, offset];

    const [countRows, users] = await Promise.all([
      sql(`SELECT COUNT(*) as count FROM "user" u ${where}`, countParams),
      sql(
        `SELECT u.id, u.name, u.email, u.role, u."createdAt",
                COUNT(o.id)::int as order_count,
                COALESCE(SUM(o.total_amount), 0)::float as total_spent
         FROM "user" u
         LEFT JOIN orders o ON o.user_id = u.id
         ${where}
         GROUP BY u.id
         ORDER BY u."createdAt" DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        dataParams
      ),
    ]);

    return Response.json({
      users,
      total: parseInt(countRows[0]?.count || '0'),
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
