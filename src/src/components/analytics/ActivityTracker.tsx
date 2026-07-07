"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { trackPageView, startAnalyticsFlushLoop, stopAnalyticsFlushLoop } from "@/lib/analytics";

// Strict 5-minute presence window - the admin "active right now" view treats
// a user as active only if a heartbeat arrived in the last 5 minutes, no
// grace period for missed beats.
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export default function ActivityTracker() {
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    startAnalyticsFlushLoop();
    void apiClient.sendHeartbeat();
    const interval = setInterval(() => {
      void apiClient.sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      stopAnalyticsFlushLoop();
    };
  }, [user]);

  useEffect(() => {
    if (!user || !pathname) return;
    trackPageView(pathname);
  }, [pathname, user]);

  return null;
}
