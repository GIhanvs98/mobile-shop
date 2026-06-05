'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, Heart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-store';
import { useEffect, useState } from 'react';

export default function Header() {
  const { totalItems } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => {});
  }, []);

  const cartCount = isMounted ? totalItems() : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">MobiStore</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="transition-colors hover:text-primary">
              All Products
            </Link>
            <Link href="/category/smartphones" className="transition-colors hover:text-primary">
              Smartphones
            </Link>
            <Link href="/category/tablets" className="transition-colors hover:text-primary">
              Tablets
            </Link>
            <Link href="/category/accessories" className="transition-colors hover:text-primary">
              Accessories
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
          <div className="hidden lg:flex relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full bg-muted pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" title="Admin Panel">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sr-only">Admin Panel</span>
                </Button>
              </Link>
            )}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <Link href="/account/signin">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
