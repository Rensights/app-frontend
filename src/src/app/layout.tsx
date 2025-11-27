import type { Metadata } from "next";
import "./globals.css";
import { getRuntimeApiUrl } from "../lib/runtime-config";

export const metadata: Metadata = {
  title: "Rensights",
  description: "Property Intelligence Platform",
  // Optimized: Add performance metadata
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#f39c12",
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
  
  // Get API URL from runtime config (reads from process.env)
  const apiUrl = getRuntimeApiUrl() || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  
  // Debug: Log on server-side only
  if (typeof window === 'undefined') {
    console.log('[Layout] process.env.API_URL:', process.env.API_URL);
    console.log('[Layout] process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    if (!apiUrl) {
      console.error('[Layout] ERROR: No API URL found in environment!');
    } else {
      console.log('[Layout] ✅ Using API URL:', apiUrl);
    }
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
        {children}
      </body>
    </html>
  );
}
