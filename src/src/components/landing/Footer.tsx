"use client";

import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary"></div>
              <span className="text-xl font-semibold">Rensights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Data-backed real estate investing in Dubai
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#solutions" className="hover:text-primary transition-colors">Solutions</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#privacy-terms" className="hover:text-primary transition-colors">Privacy Policy & Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rensights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
