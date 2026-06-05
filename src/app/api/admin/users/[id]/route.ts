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

// PUT /api/admin/users/[id] — update role
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { role } = await request.json();

    if (!role || !['admin', 'customer'].includes(role)) {
      return Response.json({ error: 'Invalid role. Must be admin or customer.' }, { status: 400 });
    }

    // Prevent self-demotion
    if (id === session.user.id && role !== 'admin') {
      return Response.json({ error: 'You cannot remove your own admin role.' }, { status: 400 });
    }

    const result = await sql(
      `UPDATE "user" SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );

    if (!result.length) return Response.json({ error: 'User not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    console.error('Admin user PUT error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
