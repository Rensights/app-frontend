import type { Metadata } from "next";
import "./globals.css";
import { getRuntimeApiUrl } from "../lib/runtime-config";
import { UserProvider } from "../context/UserContext";
import { ToastProvider } from "../components/ui/Toast";
import { LanguageProvider } from "../context/LanguageContext";

export const metadata: Metadata = {
  title: "Rensights",
  description: "Property Intelligence Platform",
  // Optimized: Add performance metadata
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#f6b042", // Match the actual background color
  other: {
    "theme-color": "#f6b042", // For older browsers
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get API URL from environment at runtime (from Kubernetes secret)
  // Server Components in App Router can read process.env at runtime
  // Regular env vars (not NEXT_PUBLIC_*) are available at runtime, not build time
  // This approach is based on: https://medium.com/geekculture/accessing-environment-variables-from-kubernetes-helm-in-nextjs-app-on-the-client-side-281cf5b60a3a
  // For App Router, we use Server Components to inject runtime values into the client
  
  // Get API URL - try multiple sources with hardcoded fallback
  let apiUrl = '';
  
  if (typeof window === 'undefined') {
    // Server-side: try environment variables first
    // SECURITY: Never hardcode API URLs - always use environment variables
    apiUrl = process.env.API_URL 
      || process.env.NEXT_PUBLIC_API_URL 
      || getRuntimeApiUrl()
      || ''; // No hardcoded fallback - fail fast if not configured
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Layout] process.env.API_URL:', process.env.API_URL);
      console.log('[Layout] process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('[Layout] ✅ Final API URL:', apiUrl);
    }
  } else {
    // Client-side: should be injected via script tag below
    apiUrl = '';
  }
  
  return (
    <html lang="en">
      <head>
        {/* Inject API URL into client-side JavaScript at runtime */}
        {/* Server Component reads runtime env var and injects it for client-side access */}
        {/* This is how Kubernetes secrets work with Next.js App Router */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__API_URL__ = ${JSON.stringify(apiUrl)};`,
          }}
        />
        {/* Optimized: Preconnect to API for faster requests */}
        {apiUrl && (
          <link rel="preconnect" href={apiUrl} crossOrigin="anonymous" />
        )}
        {/* Optimized: DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body>
        <LanguageProvider>
          <ToastProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
