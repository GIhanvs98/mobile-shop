'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/lib/cart-store';

export default function ProductsPage() {
const { addItem } = useCart();

const {
data: products = [],
isLoading,
error,
} = useQuery({
queryKey: ['products'],
queryFn: async () => {
const res = await fetch('/api/products');


  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return await res.json();
},


});

if (isLoading) {
return ( <div className="container mx-auto px-4 py-10"> <h2 className="text-xl font-bold">Loading products...</h2> </div>
);
}

if (error) {
return ( <div className="container mx-auto px-4 py-10"> <h2 className="text-red-500 text-xl font-bold">
Error Loading Products </h2> <p>{(error as Error).message}</p> </div>
);
}

return ( <div className="container mx-auto px-4 py-8"> <div className="mb-6"> <h1 className="text-3xl font-bold">Products</h1> <p className="text-gray-500">
{products.length} product(s) found </p> </div>


  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.map((product: any) => (
      <Card
        key={product.id}
        className="overflow-hidden hover:shadow-lg transition"
      >
        <Link href={`/product/${product.id}`}>
          <img
            src={
              product.image_url ||
              'https://via.placeholder.com/400x400?text=No+Image'
            }
            alt={product.name}
            className="w-full h-64 object-cover"
          />
        </Link>

        <CardContent className="p-4">
          <div className="text-sm text-gray-500">
            {product.brand}
          </div>

          <h3 className="font-bold text-lg mt-1">
            {product.name}
          </h3>

          <div className="mt-3">
            {product.discount_price ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  ${Number(product.discount_price).toFixed(2)}
                </span>

                <span className="text-gray-400 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-2 text-sm">
            Stock: {product.stock ?? 0}
          </div>
        </CardContent>

        <CardFooter className="p-4">
          <Button
            className="w-full"
            disabled={(product.stock ?? 0) <= 0}
            onClick={() => {
              addItem(product);
              toast.success(`${product.name} added to cart`);
            }}
          >
            {(product.stock ?? 0) <= 0
              ? 'Out of Stock'
              : 'Add To Cart'}
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
</div>

);
}
