import type { Metadata } from "next";
import "./globals.css";

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
  // Get API URL from environment (available at runtime from Kubernetes secret)
  // Use regular env var (not NEXT_PUBLIC_*) so it's available at runtime
  // NEXT_PUBLIC_* vars are replaced at build time, regular vars are available at runtime
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  
  return (
    <html lang="en">
      <head>
        {/* Inject API URL into client-side JavaScript at runtime */}
        {/* Always inject the script tag, even if empty, so client can read the value */}
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
