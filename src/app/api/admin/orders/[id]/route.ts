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

// GET /api/admin/orders/[id] — full order details with items
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const [orderRows, items] = await Promise.all([
      sql(
        `SELECT o.*, u.name as customer_name, u.email as customer_email
         FROM orders o JOIN "user" u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
      ),
      sql(
        `SELECT oi.*, p.name as product_name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [id]
      ),
    ]);

    if (!orderRows.length) return Response.json({ error: 'Order not found' }, { status: 404 });

    return Response.json({ ...orderRows[0], items });
  } catch (error) {
    console.error('Admin order GET error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// PUT /api/admin/orders/[id] — update order status
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await sql(`UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`, [
      status,
      id,
    ]);

    if (!result.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    console.error('Admin order PUT error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
