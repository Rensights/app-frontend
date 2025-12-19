"use client";

import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary"></div>
            <span className="text-xl font-semibold tracking-tight">Rensights</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/solutions" className="text-sm font-medium hover:text-primary transition-colors">
              Solutions
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            {/* Hidden for now - will be enabled later */}
            <Link href="/whats-new" className="text-sm font-medium hover:text-primary transition-colors hidden">
              What&apos;s New
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/portal/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center rounded-xl border p-2 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto space-y-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/solutions" className="block text-sm">
              Solutions
            </Link>
            <Link href="/pricing" className="block text-sm">
              Pricing
            </Link>
            <div className="pt-3 space-x-3">
              <Link href="/portal/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

