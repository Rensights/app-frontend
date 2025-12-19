"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Record<string, Record<string, string>>;
  loadTranslations: (namespace: string) => Promise<void>;
  t: (key: string, namespace?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const API_URL = typeof window !== 'undefined' 
  ? (window as any).__API_URL__ || process.env.NEXT_PUBLIC_API_URL || ''
  : process.env.NEXT_PUBLIC_API_URL || '';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || 'en';
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // Clear translations cache when language changes
      setTranslations({});
    }
  }, []);

  // Load translations for a namespace
  const loadTranslations = useCallback(async (namespace: string = 'common') => {
    setIsLoading(true);
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
    } catch (error) {
      console.error(`Error loading translations for ${namespace}:`, error);
      // Set empty translations on error to prevent infinite retries
      setTranslations(prev => ({
        ...prev,
        [namespace]: {},
      }));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // Translation function
  const t = useCallback((key: string, namespace: string = 'common'): string => {
    const namespaceTranslations = translations[namespace] || {};
    return namespaceTranslations[key] || key;
  }, [translations]);

  // Preload common translations on language change
  useEffect(() => {
    loadTranslations('common').catch(console.error);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations,
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

