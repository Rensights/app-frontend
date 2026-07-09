"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const API_URL =
  typeof window !== "undefined"
    ? (window as any).__API_URL__ || process.env.NEXT_PUBLIC_API_URL || ""
    : process.env.NEXT_PUBLIC_API_URL || "";

export default function GoogleAnalytics() {
  const [measurementId, setMeasurementId] = useState("");
  // Guards the one-time Consent Mode setup (default -> js -> config). This must
  // run exactly once so we never push a second consent 'default' or re-run
  // gtag('config') on re-render. Consent 'update' is deliberately NOT guarded
  // by this ref: it must re-run on every consent change.
  const configured = useRef(false);

  // Fetch the measurement id from backend settings (unchanged behavior).
  useEffect(() => {
    let isMounted = true;
    const loadMeasurementId = async () => {
      if (!API_URL) return;
      try {
        const response = await fetch(`${API_URL}/api/settings/google-analytics`, {
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        const value = (data?.measurementId || "").trim();
        if (isMounted) {
          setMeasurementId(value);
        }
      } catch {
        // Ignore errors to avoid blocking app rendering
      }
    };
    loadMeasurementId();
    return () => {
      isMounted = false;
    };
  }, []);

  // One-time Consent Mode setup. Pushes the consent 'default' (everything denied
  // except security_storage) BEFORE gtag('js')/gtag('config') and before the
  // gtag.js library <Script> loads, so the dataLayer ordering is guaranteed to
  // be: consent-default -> js -> config -> (library boots and reads the queue).
  useEffect(() => {
    if (!measurementId) return;
    if (typeof window === "undefined") return;
    if (configured.current) return;
    configured.current = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer?.push(arguments);
      };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }, [measurementId]);

  // Consent 'update' driven by Cookiebot. This is intentionally allowed to run
  // multiple times: on mount (in case CookiebotOnConsentReady fired before we
  // hydrated) and on every CookiebotOnConsentReady event (first response and
  // every later change). Updates are idempotent, and withdrawal must be able to
  // downgrade a previously granted category back to denied.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncConsent = () => {
      const c = window.Cookiebot?.consent;
      // Fail-safe: no Cookiebot (script blocked / not yet loaded) -> leave the
      // denied defaults in place.
      if (!c) return;
      // Optional call: if the default-setup effect has not run yet (e.g. this
      // fires before the measurementId fetch resolves), this is a safe no-op.
      // The mount-time sync below re-applies once gtag exists.
      window.gtag?.("consent", "update", {
        ad_storage: c.marketing ? "granted" : "denied",
        ad_user_data: c.marketing ? "granted" : "denied",
        ad_personalization: c.marketing ? "granted" : "denied",
        analytics_storage: c.statistics ? "granted" : "denied",
        functionality_storage: c.preferences ? "granted" : "denied",
        personalization_storage: c.preferences ? "granted" : "denied",
        security_storage: "granted",
      });
    };

    // Case 1: consent may already have been resolved before this component
    // mounted (Cookiebot loads beforeInteractive).
    syncConsent();

    // Case 2: catch the first consent response and any later consent changes.
    window.addEventListener("CookiebotOnConsentReady", syncConsent);

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", syncConsent);
    };
  }, [measurementId]);

  if (!measurementId) {
    return null;
  }

  return (
    <Script
      id="google-analytics"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}
