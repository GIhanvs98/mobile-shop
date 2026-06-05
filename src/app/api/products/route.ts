import sql from '@/app/api/utils/sql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
    `;
    const params: any[] = [];

    if (categorySlug) {
      query += ` AND c.slug = $${params.length + 1}`;
      params.push(categorySlug);
    }

    if (search) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR p.brand ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC`;

    const products = await sql(query, params);
    return Response.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
