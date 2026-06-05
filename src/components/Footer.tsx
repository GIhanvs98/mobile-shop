import Link from 'next/link';
import { Globe, Send, Camera, Play, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-primary">MobiStore</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop shop for the latest mobile phones, tablets, and high-quality
              accessories.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Send className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Camera className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Play className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                All Products
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQs
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Categories</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/category/smartphones"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Smartphones
              </Link>
              <Link
                href="/category/tablets"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Tablets
              </Link>
              <Link
                href="/category/accessories"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Accessories
              </Link>
              <Link
                href="/category/audio"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Audio Gear
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  123 Tech Avenue, Silicon Valley, CA 94025
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">+1 (555) 000-0000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">support@mobistore.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 MobiStore. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
