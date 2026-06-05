import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MobiStore - Latest Mobile Phones & Accessories',
  description:
    'Shop for the newest smartphones, tablets, and mobile accessories with the best prices.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
