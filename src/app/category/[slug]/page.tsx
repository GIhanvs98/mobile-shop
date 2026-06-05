'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCart } from '@/lib/cart-store';
import { toast } from 'sonner';

export default function CategoryPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', slug, baseUrl],
    queryFn: async () => {
      if (!baseUrl) return [];
      const res = await fetch(`/api/products?category=${slug}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    enabled: !!baseUrl,
  });

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 capitalize">
          {slug}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight capitalize">{slug}</h1>
        <p className="text-muted-foreground mt-2">Explore our collection of {slug}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="h-6 w-3/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product: any) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all flex flex-col h-full"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
              <CardContent className="p-4 flex-grow space-y-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-bold text-lg leading-tight hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-primary">
                    ${parseFloat(product.discount_price || product.price).toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
          {products?.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <h3 className="text-xl font-semibold">No products found in this category</h3>
              <Link href="/products">
                <Button variant="outline">Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
