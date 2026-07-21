"use client";

import { useCallback, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function useTranslations(
  namespace: string,
  fallbacks: Record<string, string> = {}
) {
  const { t, loadTranslations, translationsMeta, translations, translationErrors } = useLanguage();

  useEffect(() => {
    loadTranslations(namespace).catch(() => {});
  }, [namespace, loadTranslations]);

  // True once this namespace's translations have been fetched (or seeded) for
  // the current language. Pages can gate on it to show a loader instead of the
  // default/fallback text and then re-rendering (translation FOUC). Set even on
  // fetch error (context stores {}), so a failure never leaves the page loading.
  const ready = translations[namespace] !== undefined;
  // True when the last fetch for this namespace failed — pages can show an error
  // message instead of hanging on the loader or rendering fallback keys.
  const error = translationErrors[namespace] === true;

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

  return { t: translate, updatedAt: translationsMeta[namespace]?.updatedAt, ready, error };
}
