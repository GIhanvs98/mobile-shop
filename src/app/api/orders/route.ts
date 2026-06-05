import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

// POST /api/orders — place a new order from the current user's cart payload
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'You must be signed in to place an order.' }, { status: 401 });
    }

    const body = await request.json();
    const { items, payment_method, shipping_address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    if (!payment_method) {
      return Response.json({ error: 'Payment method is required.' }, { status: 400 });
    }

    // Verify all products exist and have enough stock, and fetch current prices
    const productIds = items.map((i: any) => i.product_id);
    const placeholders = productIds.map((_: any, idx: number) => `$${idx + 1}`).join(', ');
    const products = await sql(
      `SELECT id, price, discount_price, stock, name FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Validate stock
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return Response.json({ error: `Product #${item.product_id} not found.` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for "${product.name}". Available: ${product.stock}` },
          { status: 400 }
        );
      }
    }

    // Calculate total using DB prices (not client-supplied prices)
    const total = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.product_id);
      const price = parseFloat(product.discount_price || product.price);
      return sum + price * item.quantity;
    }, 0);

    // Insert order + items in a transaction
    const client = await (sql as any).connect?.() ?? null;

    // Use neon HTTP (no real transactions in serverless) — run sequentially
    const orderResult = await sql(
      `INSERT INTO orders (user_id, total_amount, status, payment_method)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *`,
      [session.user.id, total.toFixed(2), payment_method]
    );

    const order = orderResult[0];

    // Insert order items
    for (const item of items) {
      const product = productMap.get(item.product_id);
      const unitPrice = parseFloat(product.discount_price || product.price);
      await sql(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, unitPrice.toFixed(2)]
      );
      // Decrement stock
      await sql(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Place order error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/orders — current user's order history
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await sql(
      `SELECT o.id, o.total_amount, o.status, o.payment_method, o.created_at,
              COUNT(oi.id)::int as item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [session.user.id]
    );

    return Response.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
