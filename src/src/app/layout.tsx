import type { Metadata } from "next";
import getConfig from "next/config";
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
  // Get API URL from publicRuntimeConfig (available at runtime from Kubernetes secret)
  // This is the proper way to access runtime env vars in Next.js
  // Based on: https://medium.com/geekculture/accessing-environment-variables-from-kubernetes-helm-in-nextjs-app-on-the-client-side-281cf5b60a3a
  const { publicRuntimeConfig } = getConfig();
  const apiUrl = publicRuntimeConfig?.apiUrl || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  
  return (
    <html lang="en">
      <head>
        {/* Inject API URL into client-side JavaScript at runtime */}
        {/* This allows client-side code to access the runtime value from Kubernetes secret */}
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
