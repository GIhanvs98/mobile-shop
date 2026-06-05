'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-store';
import {
  ChevronLeft,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────── */
/* Types                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const PAYMENT_METHODS = [
  {
    id: 'credit_card',
    label: 'Credit / Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex',
  },
  {
    id: 'upi',
    label: 'UPI',
    icon: Smartphone,
    description: 'GPay, PhonePe, Paytm',
  },
  {
    id: 'net_banking',
    label: 'Net Banking',
    icon: Landmark,
    description: 'All major banks supported',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: Wallet,
    description: 'Pay when you receive',
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function InputField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  colSpan2 = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  colSpan2?: boolean;
}) {
  return (
    <div className={colSpan2 ? 'col-span-2' : ''}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all
                   placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Order success screen                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function OrderSuccess({ orderId }: { orderId: number }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
            <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-30" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Order Placed! 🎉</h1>
          <p className="text-gray-500">
            Your order <span className="font-bold text-indigo-600">#{orderId}</span> has been
            confirmed and is being processed.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3 text-sm text-left">
          {[
            { icon: '📦', text: 'Order confirmed & being processed' },
            { icon: '🚚', text: 'Estimated delivery: 3–5 business days' },
            { icon: '📧', text: 'Confirmation sent to your email' },
          ].map((step) => (
            <div key={step.text} className="flex items-center gap-3 text-gray-600">
              <span className="text-xl">{step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/products')}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700
                       hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white
                       hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main checkout page                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const set = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if cart is empty (after mount)
  useEffect(() => {
    if (isMounted && items.length === 0 && !placedOrderId) {
      router.replace('/cart');
    }
  }, [isMounted, items, placedOrderId, router]);

  const subtotal = isMounted ? totalPrice() : 0;
  const shipping = subtotal >= 150 ? 0 : 9.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((subtotal + shipping + tax).toFixed(2));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          payment_method: paymentMethod,
          shipping_address: form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      clearCart();
      setPlacedOrderId(data.order.id);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (placedOrderId) return <OrderSuccess orderId={placedOrderId} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to cart
          </Link>
          <div className="flex-1 flex justify-center">
            <span className="text-lg font-bold text-indigo-600">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            SSL Secured
          </div>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Left column ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Shipping */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  id="fullName"
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="John Doe"
                  colSpan2
                />
                <InputField
                  label="Email Address"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="john@example.com"
                />
                <InputField
                  label="Phone Number"
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+1 (555) 000-0000"
                />
                <InputField
                  label="Street Address"
                  id="address"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="123 Main St, Apt 4B"
                  colSpan2
                />
                <InputField
                  label="City"
                  id="city"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="New York"
                />
                <InputField
                  label="State / Province"
                  id="state"
                  value={form.state}
                  onChange={set('state')}
                  placeholder="NY"
                />
                <InputField
                  label="ZIP / Postal Code"
                  id="zip"
                  value={form.zip}
                  onChange={set('zip')}
                  placeholder="10001"
                />
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all
                        ${active
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                          ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${active ? 'text-indigo-700' : 'text-gray-800'}`}>
                          {method.label}
                        </p>
                        <p className="text-xs text-gray-400">{method.description}</p>
                      </div>
                      {active && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dummy card fields — shown only for credit_card */}
              {paymentMethod === 'credit_card' && (
                <div className="mt-2 space-y-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm
                                 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={7}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm
                                   outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm
                                   outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Dummy fields — no real payment is processed
                  </p>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm
                               outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Dummy field — no real payment is processed
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ── Right column — Order summary ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {isMounted &&
                    items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    You qualify for free shipping!
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isMounted}
                  className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white
                             hover:bg-indigo-700 active:scale-[.98] transition-all
                             disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Place Order · ${grandTotal.toFixed(2)}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400">
                  By placing your order, you agree to our{' '}
                  <span className="underline cursor-pointer">Terms of Service</span> &amp;{' '}
                  <span className="underline cursor-pointer">Privacy Policy</span>
                </p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-500">
                {[
                  { icon: '🔒', label: 'Secure Checkout' },
                  { icon: '↩️', label: '30-Day Returns' },
                  { icon: '✅', label: 'Genuine Products' },
                ].map((b) => (
                  <div key={b.label} className="bg-white rounded-xl border border-gray-100 p-3 space-y-1">
                    <div className="text-xl">{b.icon}</div>
                    <div className="font-medium">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
