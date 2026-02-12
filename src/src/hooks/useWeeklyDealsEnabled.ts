import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export function useWeeklyDealsEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const response = await apiClient.getWeeklyDealsEnabled();
        if (isMounted) {
          setEnabled(response.enabled);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load weekly deals setting:", error);
        }
        if (isMounted) {
          setEnabled(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { enabled, loading };
}
