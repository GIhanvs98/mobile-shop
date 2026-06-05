import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ isAdmin: false }, { status: 401 });
    }

    const users = await sql(`SELECT role FROM "user" WHERE id = $1`, [session.user.id]);
    const isAdmin = users?.[0]?.role === 'admin';

    return Response.json({ isAdmin, user: session.user });
  } catch (error) {
    console.error('Admin check error:', error);
    return Response.json({ isAdmin: false }, { status: 500 });
  }
}
