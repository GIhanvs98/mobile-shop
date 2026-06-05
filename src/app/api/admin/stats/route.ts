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

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      productCount,
      categoryCount,
      orderCount,
      userCount,
      revenue,
      pendingOrders,
      monthlySales,
      recentOrders,
      ordersByStatus,
    ] = await sql.transaction([
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM categories`,
      sql`SELECT COUNT(*) as count FROM orders`,
      sql`SELECT COUNT(*) as count FROM "user" WHERE role != 'admin'`,
      sql`SELECT COALESCE(SUM(total_amount), 0)::float as total FROM orders WHERE status != 'cancelled'`,
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`,
      sql`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
          DATE_TRUNC('month', created_at) as month_date,
          COALESCE(SUM(total_amount), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at) ASC
      `,
      sql`
        SELECT o.id, o.total_amount, o.status, o.created_at, o.payment_method,
               u.name as customer_name, u.email as customer_email
        FROM orders o
        JOIN "user" u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `,
      sql`
        SELECT status, COUNT(*)::int as count
        FROM orders
        GROUP BY status
      `,
    ]);

    return Response.json({
      stats: {
        products: parseInt(productCount[0]?.count || '0'),
        categories: parseInt(categoryCount[0]?.count || '0'),
        orders: parseInt(orderCount[0]?.count || '0'),
        users: parseInt(userCount[0]?.count || '0'),
        revenue: parseFloat(revenue[0]?.total || '0'),
        pendingOrders: parseInt(pendingOrders[0]?.count || '0'),
      },
      monthlySales,
      recentOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
