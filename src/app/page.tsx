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
              src="https://images.unsplash.com/photo-1556656793-062ff98782ee?q=80&w=1200&auto=format&fit=crop"
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
