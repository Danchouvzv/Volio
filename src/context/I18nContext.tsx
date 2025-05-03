'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for translations
type TranslationValue = string | Record<string, TranslationValue>;
type Translations = Record<string, TranslationValue>;

// I18n context type
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<string>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        // Dynamic import based on locale
        const localeData = await import(`../i18n/locales/${locale}.json`);
        setTranslations(localeData);
      } catch (error) {
        console.error(`Failed to load translations for ${locale}:`, error);
        // Fallback to English
        if (locale !== 'en') {
          const enData = await import('../i18n/locales/en.json');
          setTranslations(enData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Load translations
    loadTranslations();

    // Sync with localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', locale);
    }
  }, [locale]);

  // Initialize locale from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('language');
      if (savedLocale && ['en', 'ru', 'kz'].includes(savedLocale)) {
        setLocale(savedLocale);
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'ru', 'kz'].includes(browserLang)) {
          setLocale(browserLang);
        }
      }
    }
  }, []);

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    // Split the key by dots
    const parts = key.split('.');
    
    // Traverse the translations object
    let result: TranslationValue = translations;
    
    for (const part of parts) {
      if (typeof result === 'object' && result !== null && part in result) {
        result = result[part];
      } else {
        // Fallback to the key itself if translation not found
        return key;
      }
    }
    
    // If the result is not a string, return the key
    if (typeof result !== 'string') {
      return key;
    }
    
    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, value]) => str.replace(new RegExp(`{${param}}`, 'g'), value),
        result
      );
    }
    
    return result;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook for using the I18n context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Short alias for translation function
export const useT = () => {
  const { t } = useI18n();
  return t;
}; 