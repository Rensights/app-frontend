"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    // Injected at container startup by docker-entrypoint.sh (see window.__API_URL__).
    __FARO_URL__?: string;
    // Guards against double-init under React StrictMode / re-mounts.
    __FARO_INITED__?: boolean;
  }
}

// Full Grafana Faro collector URL, incl. app key:
//   https://faro-collector-prod-eu-west-2.grafana.net/collect/<app-key>
// The app key is a public, browser-exposed value (not a secret), so it's fine to
// inject it as runtime config the same way as __API_URL__.
const FARO_URL =
  typeof window !== "undefined"
    ? window.__FARO_URL__ || process.env.NEXT_PUBLIC_FARO_URL || ""
    : process.env.NEXT_PUBLIC_FARO_URL || "";

export default function Faro() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!FARO_URL) return; // not configured -> no-op
    if (window.__FARO_INITED__) return;
    window.__FARO_INITED__ = true;

    // Client-only dynamic import keeps the Faro SDK out of the SSR/initial bundle.
    (async () => {
      try {
        const { initializeFaro, getWebInstrumentations } = await import(
          "@grafana/faro-web-sdk"
        );
        const { TracingInstrumentation } = await import(
          "@grafana/faro-web-tracing"
        );
        initializeFaro({
          url: FARO_URL,
          app: {
            name: "frontend",
            version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
            environment: "dev",
          },
          instrumentations: [
            ...getWebInstrumentations(),
            new TracingInstrumentation(),
          ],
        });
      } catch {
        // Never let RUM setup break the app.
        window.__FARO_INITED__ = false;
      }
    })();
  }, []);

  return null;
}
