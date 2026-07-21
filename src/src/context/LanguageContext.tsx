"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Record<string, Record<string, string>>;
  translationsMeta: Record<string, { updatedAt?: string }>;
  translationErrors: Record<string, boolean>;
  loadTranslations: (namespace: string) => Promise<void>;
  t: (key: string, namespace?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const API_URL = typeof window !== 'undefined' 
  ? (window as any).__API_URL__ || process.env.NEXT_PUBLIC_API_URL || ''
  : process.env.NEXT_PUBLIC_API_URL || '';

export function LanguageProvider({
  children,
  initialLanguage = 'en',
  initialTranslations = {},
}: {
  children: ReactNode;
  initialLanguage?: string;
  initialTranslations?: Record<string, Record<string, string>>;
}) {
  const [language, setLanguageState] = useState<string>(initialLanguage);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(initialTranslations);
  const [translationsMeta, setTranslationsMeta] = useState<Record<string, { updatedAt?: string }>>({});
  const [translationErrors, setTranslationErrors] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const initialLangRef = useRef(initialLanguage);

  // Read stored language AFTER mount (server can't know localStorage). The first
  // client render uses initialLanguage so HTML is byte-identical to the server;
  // this swap is a post-commit update, not a hydration mismatch.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || initialLangRef.current;
      if (savedLanguage !== language) {
        setLanguageState(savedLanguage);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save language to localStorage when it changes
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // Clear translations cache when language changes
      setTranslations({});
      setTranslationsMeta({});
      setTranslationErrors({});
    }
  }, []);

  // Load translations for a namespace. Retries a few times before giving up, so a
  // transient hiccup (a deploy rollout window, a network blip) self-heals instead
  // of surfacing the "Something went wrong" error to the user.
  const loadTranslations = useCallback(async (namespace: string = 'common') => {
    setIsLoading(true);
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${API_URL}/api/translations/${language}/${namespace}`);
        if (!response.ok) {
          throw new Error(`Failed to load translations: ${response.status}`);
        }
        const data = await response.json();

        setTranslations(prev => ({
          ...prev,
          [namespace]: data.translations || {},
        }));
        setTranslationsMeta(prev => ({
          ...prev,
          [namespace]: { updatedAt: data.updatedAt },
        }));
        setTranslationErrors(prev => ({ ...prev, [namespace]: false }));
        setIsLoading(false);
        return;
      } catch (error) {
        // Retry transient failures with a short backoff (400ms, 800ms) before
        // marking the namespace as errored.
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 400 * attempt));
          continue;
        }
        console.error(`Error loading translations for ${namespace} after ${maxAttempts} attempts:`, error);
        // Set empty translations on error to prevent infinite retries
        setTranslations(prev => ({
          ...prev,
          [namespace]: {},
        }));
        setTranslationErrors(prev => ({ ...prev, [namespace]: true }));
      }
    }
    setIsLoading(false);
  }, [language]);

  // Translation function
  const t = useCallback((key: string, namespace: string = 'common'): string => {
    const namespaceTranslations = translations[namespace] || {};
    return namespaceTranslations[key] || key;
  }, [translations]);

  // Preload common translations on language change. Skip when we already have
  // the server-seeded bundle for the initial language (the 'en' fast path does
  // ZERO client fetches). If the seed is empty (build-time prerender before the
  // first ISR regen), `have` is false so the client self-heals by fetching.
  useEffect(() => {
    const have = Object.keys(translations['common'] || {}).length > 0;
    if (language === initialLangRef.current && have) return;
    loadTranslations('common').catch(console.error);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        translationsMeta,
        translationErrors,
        loadTranslations,
        t,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return a default context instead of throwing to prevent crashes
    // This can happen during SSR or if component renders before provider
    console.warn('useLanguage called outside LanguageProvider, using defaults');
    return {
      language: 'en',
      setLanguage: () => {},
      translations: {},
      translationsMeta: {},
      translationErrors: {},
      loadTranslations: async () => {},
      t: (key: string) => key,
      isLoading: false,
    };
  }
  return context;
}

