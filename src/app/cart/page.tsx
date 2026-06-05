'use client';

import { useCart } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemove = (id: number, name: string) => {
    removeItem(id);
    toast.error(`${name} removed from cart`);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
          </p>
        </div>
        <Link href="/products">
          <Button size="lg" className="px-8 mt-4">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({totalItems()} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-4 flex gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                <div className="flex flex-col justify-between flex-grow py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Premium Quality</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item.product_id, item.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-end gap-4 mt-4">
                    <div className="flex items-center border rounded-md h-9">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-muted/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Link href="/checkout">
                  <Button className="w-full h-12 text-lg">
                    Checkout <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary fill-primary" />
              Special Offer
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add products worth <span className="font-bold text-primary">$150.00</span> or more to
              get a free Screen Protector!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Zap = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14.71 14 3h1l-4 8.29H20l-10 11.71h-1l4-8.29H4Z" />
  </svg>
);
