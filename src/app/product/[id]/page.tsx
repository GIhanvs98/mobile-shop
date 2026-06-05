'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  Minus,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/lib/cart-store';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-xl"></div>
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-muted rounded"></div>
            <div className="h-6 w-1/4 bg-muted rounded"></div>
            <div className="h-20 w-full bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Results
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted border">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain p-8"
            />
          </div>
          {product.additional_images?.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.additional_images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-muted border cursor-pointer hover:border-primary transition-colors"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary">
              {product.category_name}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold text-sm">4.9</span>
                <span className="text-muted-foreground text-sm">(128 Reviews)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Badge
                variant={product.stock > 0 ? 'default' : 'destructive'}
                className="rounded-full"
              >
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-primary">
                ${parseFloat(product.discount_price || product.price).toFixed(2)}
              </span>
              {product.discount_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              )}
            </div>
            {product.discount_price && (
              <p className="text-green-600 text-sm font-medium">
                You save $
                {(parseFloat(product.price) - parseFloat(product.discount_price)).toFixed(2)}!
              </p>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 h-12"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="h-12 w-12 p-0">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center gap-1">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Free Delivery</span>
              <span className="text-[10px] text-muted-foreground">Orders over $150</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center gap-1">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">30 Days Return</span>
              <span className="text-[10px] text-muted-foreground">Easy returns</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center gap-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">Genuine Product</span>
              <span className="text-[10px] text-muted-foreground">100% Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for detailed info */}
      <Tabs defaultValue="specs" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent gap-8">
          <TabsTrigger
            value="specs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold"
          >
            Specifications
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold"
          >
            Reviews ({product.reviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold"
          >
            Shipping Info
          </TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="py-8">
          <div className="max-w-3xl space-y-4">
            <h3 className="text-xl font-bold">Technical Specifications</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(product.specifications || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex border-b py-2">
                  <span className="w-1/3 font-semibold text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="w-2/3">
                    {typeof value === 'object' && value !== null
                      ? Object.entries(value)
                          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                          .join(' · ')
                      : String(value)}
                  </span>
                </div>
              ))}
              {!product.specifications && (
                <p className="text-muted-foreground italic">
                  No specifications available for this product.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-8">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Customer Reviews</h3>
              <Button>Write a Review</Button>
            </div>
            {product.reviews?.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="space-y-2 border-b pb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-sm">{review.user_name}</span>
                      <span className="text-muted-foreground text-xs">
                        {isMounted ? review.created_at?.split('T')[0] : ''}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl space-y-2">
                <p className="font-semibold">No reviews yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="shipping" className="py-8">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-xl font-bold">Shipping & Delivery Information</h3>
            <p className="text-muted-foreground">
              We offer several shipping options to meet your needs:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong>Standard Shipping:</strong> 3-5 business days - Free for orders over $150
              </li>
              <li>
                <strong>Express Shipping:</strong> 1-2 business days - $19.99
              </li>
              <li>
                <strong>Next Day Delivery:</strong> Available in select locations - $29.99
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4 italic">
              * Delivery times may vary based on your location and carrier availability.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
