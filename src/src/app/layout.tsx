import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getRuntimeApiUrl, getRuntimeGoogleClientIdForInjection } from "../lib/runtime-config";
import { UserProvider } from "../context/UserContext";
import { ToastProvider } from "../components/ui/Toast";
import { LanguageProvider } from "../context/LanguageContext";
import Clarity from "../components/analytics/Clarity";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import { ErrorLogger } from "../components/analytics/ErrorLogger";

// Root layout must read K8s env at request time, not at `next build` (otherwise
// `window.__API_URL__` is stuck with build-time or fallback values).
export const dynamic = "force-dynamic";

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
    apiUrl = process.env.API_URL
      || process.env.NEXT_PUBLIC_API_URL
      || getRuntimeApiUrl()
      // Same-origin API when proxied (e.g. https://rensights.com/api) — never use http: here
      // or the browser will block mixed content on HTTPS pages.
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://rensights.com");
  } else {
    // Client-side: should be injected via script tag below
    apiUrl = '';
  }

  const googleClientIdRuntime =
    typeof window === "undefined" ? getRuntimeGoogleClientIdForInjection() : "";

  return (
    <html lang="en">
      <head>
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          strategy="beforeInteractive"
          data-cbid="dc13aae5-c69f-42aa-85b3-a0809f605ec3"
          data-blockingmode="auto"
        />
        {/* Inject API URL into client-side JavaScript at runtime */}
        {/* Server Component reads runtime env var and injects it for client-side access */}
        {/* This is how Kubernetes secrets work with Next.js App Router */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__API_URL__ = ${JSON.stringify(apiUrl)}; window.__GOOGLE_CLIENT_ID__ = ${JSON.stringify(googleClientIdRuntime)};`,
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
        <Clarity />
        <GoogleAnalytics />
        <ErrorLogger />
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
