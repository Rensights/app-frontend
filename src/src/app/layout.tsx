import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { UserProvider } from "../context/UserContext";
import { ToastProvider } from "../components/ui/Toast";
import { LanguageProvider } from "../context/LanguageContext";
import Clarity from "../components/analytics/Clarity";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import { ErrorLogger } from "../components/analytics/ErrorLogger";
import ActivityTracker from "../components/analytics/ActivityTracker";
import Faro from "../components/analytics/Faro";

// Root layout is Static/ISR. Runtime K8s env is injected client-side via the
// blocking /env.js script (written at container startup), NOT at render time.
export const revalidate = 3600;

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

// Server-side fetch of the default 'en' common bundle so first paint shows real
// text (no key-FOUC). Must stay cacheable (revalidate, no no-store) and must NOT
// touch cookies()/headers(), or the whole route tree turns dynamic.
async function getInitialCommon(): Promise<Record<string, string>> {
  // Prefer an in-cluster service URL for the server-side hop. On dynamic routes
  // (force-dynamic portal/authenticated) this fetch runs per request; routing it
  // to the public hostname makes the frontend pod hairpin out through the ingress
  // and back, which hangs until the abort below. INTERNAL_API_URL (e.g.
  // http://<backend-svc>.<ns>.svc.cluster.local:<port>) resolves in ~5ms instead.
  const base =
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';
  if (!base) return {};
  try {
    // Bound the SSR wait: this runs on the critical path of every dynamic
    // route (portal/authenticated) on a cold data cache. Keep it short — the
    // client-side LanguageProvider self-heals by fetching, so a miss only costs
    // a first-paint FOUC, never a multi-second TTFB. On abort we return {}.
    const res = await fetch(`${base}/api/translations/en/common`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(500),
    });
    if (!res.ok) return {};
    return (await res.json()).translations ?? {};
  } catch {
    return {};
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialCommon = await getInitialCommon();

  return (
    <html lang="en">
      <head>
        {/* Runtime K8s env injection: blocking classic script written to
            public/env.js at container startup. Must load before any other
            script that reads window.__API_URL__. Not next/script, not async. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- intentional: env.js must block before any script reads window.__API_URL__ */}
        <script src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/env.js`} />
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          strategy="beforeInteractive"
          data-cbid="dc13aae5-c69f-42aa-85b3-a0809f605ec3"
          data-blockingmode="auto"
        />
        {/* Optimized: DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body>
        <Clarity />
        <GoogleAnalytics />
        <Faro />
        <ErrorLogger />
        <LanguageProvider initialLanguage="en" initialTranslations={{ common: initialCommon }}>
          <ToastProvider>
            <UserProvider>
              <ActivityTracker />
              {children}
            </UserProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
