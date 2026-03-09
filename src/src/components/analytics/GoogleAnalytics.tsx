"use client";

import { useEffect, useState } from "react";
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
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
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
