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
  // Google Analytics belongs to the "statistics" consent category. We only
  // configure gtag and inject its <Script> after Cookiebot grants that consent.
  const [consentGranted, setConsentGranted] = useState(false);
  // Guards against configuring gtag more than once: CookiebotOnConsentReady
  // can fire multiple times.
  const configured = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncConsent = () => {
      // Fail closed: no consent, or Cookiebot absent (script blocked) -> false.
      if (window.Cookiebot?.consent?.statistics) {
        setConsentGranted(true);
      }
    };

    // Case 1: consent may already have been granted before this component
    // mounted (Cookiebot loads beforeInteractive).
    syncConsent();

    // Case 2: catch the first consent response and any later consent changes.
    window.addEventListener("CookiebotOnConsentReady", syncConsent);

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", syncConsent);
    };
  }, []);

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

  useEffect(() => {
    if (!measurementId) return;
    if (!consentGranted) return;
    if (typeof window === "undefined") return;
    if (configured.current) return;
    configured.current = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }, [measurementId, consentGranted]);

  if (!measurementId || !consentGranted) {
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
