import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

// POST /api/admin/setup — Makes the current user an admin.
// Only works if no admin exists yet (first-time setup).
export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'You must be signed in to do this.' }, { status: 401 });
    }

    const existingAdmins = await sql(`SELECT id FROM "user" WHERE role = 'admin' LIMIT 1`);
    if (existingAdmins.length > 0) {
      return Response.json(
        { error: 'An admin already exists. Contact your admin to promote you.' },
        { status: 403 }
      );
    }

    await sql(`UPDATE "user" SET role = 'admin' WHERE id = $1`, [session.user.id]);
    return Response.json({ success: true, message: 'You are now an admin!' });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
