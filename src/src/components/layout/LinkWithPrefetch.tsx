"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface LinkWithPrefetchProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  [key: string]: any;
}

/**
 * Enhanced Link component that prefetches pages on hover
 * Improves perceived performance by loading pages before click
 */
export function LinkWithPrefetch({ 
  href, 
  children, 
  className,
  prefetch = true,
  ...props 
}: LinkWithPrefetchProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    if (prefetch && typeof window !== 'undefined') {
      router.prefetch(href);
    }
  }, [href, prefetch, router]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}






