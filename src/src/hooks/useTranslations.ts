"use client";

import { useCallback, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function useTranslations(
  namespace: string,
  fallbacks: Record<string, string> = {}
) {
  const { t, loadTranslations } = useLanguage();

  useEffect(() => {
    loadTranslations(namespace).catch(() => {});
  }, [namespace, loadTranslations]);

  const translate = useCallback(
    (key: string) => {
      const value = t(key, namespace);
      if (value === key && fallbacks[key]) {
        return fallbacks[key];
      }
      return value;
    },
    [t, namespace, fallbacks]
  );

  return { t: translate };
}
