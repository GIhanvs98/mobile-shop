import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const categories = await sql(`
      SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC
    `);
    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
