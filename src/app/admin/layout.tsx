'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  ArrowLeft,
  Menu,
  LogOut,
  Store,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((data) => {
        if (!data.isAdmin) {
          router.replace('/account/signin');
        } else {
          setAdminUser(data.user);
        }
      })
      .catch(() => router.replace('/account/signin'))
      .finally(() => setChecking(false));
  }, [router]);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const handleSignOut = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/') } });
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-lg animate-pulse">Loading admin panel…</div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-tight">MobiStore</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
              {active && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-1 border-t border-slate-700 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          Back to Store
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>

      {/* User info */}
      {adminUser && (
        <div className="px-4 py-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs font-medium text-white truncate">{adminUser.name}</p>
          <p className="text-xs text-slate-400 truncate">{adminUser.email}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-10">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 lg:px-6 py-4 flex items-center justify-between shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800 hidden lg:block">
            {navItems.find((n) => isActive(n))?.label ?? 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{adminUser?.email}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Store
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
