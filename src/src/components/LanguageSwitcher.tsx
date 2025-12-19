"use client";

import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";

interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
  enabled: boolean;
  isDefault: boolean;
}

const API_URL = typeof window !== 'undefined' 
  ? (window as any).__API_URL__ || process.env.NEXT_PUBLIC_API_URL || ''
  : process.env.NEXT_PUBLIC_API_URL || '';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/languages`);
        if (response.ok) {
          const languages = await response.json();
          setAvailableLanguages(languages);
          // If current language is not enabled, switch to default or first enabled
          const enabledCodes = languages.map((l: Language) => l.code);
          if (!enabledCodes.includes(language)) {
            const defaultLang = languages.find((l: Language) => l.isDefault);
            if (defaultLang) {
              setLanguage(defaultLang.code);
            } else if (languages.length > 0) {
              setLanguage(languages[0].code);
            }
          }
        }
      } catch (error) {
        console.error("Error loading languages:", error);
        // Fallback to English if API fails
        if (!availableLanguages.length) {
          setAvailableLanguages([{ code: 'en', name: 'English', flag: '🇬🇧', enabled: true, isDefault: true }]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, [language, setLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || availableLanguages.length === 0) {
    return (
      <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag ? `${lang.flag} ` : ''}{lang.nativeName || lang.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

