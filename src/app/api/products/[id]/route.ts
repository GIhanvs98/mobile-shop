import sql from '@/app/api/utils/sql';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Fetch product details
    const productRows = await sql(
      `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `,
      [id]
    );

    if (!productRows || productRows.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productRows[0];

    // Fetch additional images
    const images = await sql(
      `
      SELECT image_url FROM product_images WHERE product_id = $1
    `,
      [id]
    );

    product.additional_images = images.map((img: any) => img.image_url);

    // Fetch reviews
    const reviews = await sql(
      `
      SELECT r.*, u.name as user_name 
      FROM reviews r
      JOIN "user" u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `,
      [id]
    );

    product.reviews = reviews;

    return Response.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
