import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";

const CACHE_TTL_MS = 30_000;

type Cached = { enabled: boolean; fetchedAt: number };
let sharedCache: Cached | null = null;

/** Clear after logout so the next session does not reuse another user's cached flag. */
export function clearWeeklyDealsEnabledCache() {
  sharedCache = null;
}

/**
 * Feature flag for weekly deals surfaces. Uses a short shared cache so remounting
 * after client-side navigation avoids a stuck spinner and matches the sidebar quickly.
 */
export function useWeeklyDealsEnabled() {
  const pathname = usePathname();

  const [enabled, setEnabled] = useState<boolean | null>(() =>
    sharedCache && Date.now() - sharedCache.fetchedAt < CACHE_TTL_MS
      ? sharedCache.enabled
      : null
  );
  const [loading, setLoading] = useState(
    () =>
      !(sharedCache && Date.now() - sharedCache.fetchedAt < CACHE_TTL_MS)
  );

  useEffect(() => {
    let isMounted = true;

    const applyFresh = (value: boolean) => {
      sharedCache = { enabled: value, fetchedAt: Date.now() };
      if (isMounted) {
        setEnabled(value);
        setLoading(false);
      }
    };

    const load = async () => {
      if (sharedCache && Date.now() - sharedCache.fetchedAt < CACHE_TTL_MS) {
        if (isMounted) {
          setEnabled(sharedCache.enabled);
          setLoading(false);
        }
        return;
      }

      if (isMounted) setLoading(true);

      try {
        const response = await apiClient.getWeeklyDealsEnabled();
        applyFresh(Boolean(response.enabled));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load weekly deals setting:", error);
        }
        applyFresh(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return { enabled, loading };
}
