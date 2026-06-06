'use client';

import Link from 'next/link';
import { ArrowRight, Star, ShoppingCart, Heart, Zap, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 999.0,
    discountPrice: 949.0,
    rating: 4.9,
    reviews: 128,
    image:
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop',
    tag: 'Popular',
  },
  {
    id: 2,
    name: 'Galaxy S24 Ultra',
    price: 1299.0,
    discountPrice: 1199.0,
    rating: 4.8,
    reviews: 95,
    image:
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
    tag: 'Hot',
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    price: 249.0,
    discountPrice: 199.0,
    rating: 4.9,
    reviews: 210,
    image:
      'https://images.unsplash.com/photo-1588423770574-01b444589d9c?q=80&w=800&auto=format&fit=crop',
    tag: 'Best Seller',
  },
  {
    id: 4,
    name: 'Pixel 8 Pro',
    price: 999.0,
    discountPrice: 899.0,
    rating: 4.7,
    reviews: 64,
    image:
      'https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?q=80&w=800&auto=format&fit=crop',
    tag: 'New',
  },
];

const categories = [
  {
    name: 'Smartphones',
    count: '120+ Items',
    icon: '📱',
    color: 'bg-blue-50 text-blue-600',
    slug: 'smartphones',
  },
  {
    name: 'Tablets',
    count: '45+ Items',
    icon: 'Tablet',
    color: 'bg-purple-50 text-purple-600',
    slug: 'tablets',
  },
  {
    name: 'Audio Gear',
    count: '80+ Items',
    icon: '🎧',
    color: 'bg-orange-50 text-orange-600',
    slug: 'audio',
  },
  {
    name: 'Accessories',
    count: '200+ Items',
    icon: '🔌',
    color: 'bg-green-50 text-green-600',
    slug: 'accessories',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              Summer Sale - Up to 40% Off
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              The Future of Mobile is <span className="text-primary">Here</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Discover the latest flagship smartphones and premium accessories. Experience
              technology like never before with our curated collection.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="h-12 px-8">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8">
                Explore Categories
              </Button>
            </div>
          </div>
          <div className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="data:image/jpeg;base64,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"
              alt="Latest Smartphones"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
          <Button variant="ghost">View All</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={`/category/${category.slug}`}>
              <Card className="hover:shadow-lg transition-all border-none bg-card/50">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${category.color}`}
                  >
                    {category.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground text-sm">Hand-picked premium selections for you</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary/90">{product.tag}</Badge>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews})</span>
                </div>
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-bold text-lg leading-tight hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold">
                    ${product.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full group/btn">
                  Add to Cart
                  <ShoppingCart className="ml-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Features/Benefits */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-xl">Free Express Shipping</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              On all orders over $150. Fast and secure delivery to your doorstep.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-xl">Official Warranty</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              100% authentic products with official manufacturer warranty support.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-xl">Secure Payments</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Multiple secure payment options including Credit Cards and EMI.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-12">
        <Card className="bg-primary text-primary-foreground p-8 md:p-12 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">Stay Connected</h2>
              <p className="text-primary-foreground/80">
                Subscribe to our newsletter for exclusive deals and latest tech news.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border-none bg-white/10 px-4 py-2 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/20 outline-none"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </Card>
      </section>
    </div>
  );
}
