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
  // This is injected into the client-side JavaScript at runtime
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  return (
    <html lang="en">
      <head>
        {/* Inject API URL into client-side JavaScript at runtime */}
        {/* This allows the API client to read it from window.__API_URL__ */}
        {apiUrl && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__API_URL__ = ${JSON.stringify(apiUrl)};`,
            }}
          />
        )}
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
