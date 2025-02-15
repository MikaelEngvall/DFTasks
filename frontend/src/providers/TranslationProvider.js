import React, { createContext, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DataService from '../services/DataService';

const TranslationContext = createContext(null);

export const TranslationProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const translateContent = useCallback(async (content, targetLang) => {
    const cacheKey = `translation_${content}_${targetLang}`;
    
    return DataService.fetchWithCache(
      cacheKey,
      async () => {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: content,
            targetLang,
          }),
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        return data.translation;
      },
      { ttl: 24 * 60 * 60 * 1000 } // Cache för 24 timmar
    );
  }, []);

  const translateObject = useCallback(async (obj, targetLang) => {
    const translatedObj = { ...obj };
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        translatedObj[key] = await translateContent(value, targetLang);
      } else if (typeof value === 'object' && value !== null) {
        translatedObj[key] = await translateObject(value, targetLang);
      }
    }
    
    return translatedObj;
  }, [translateContent]);

  const changeLanguage = useCallback(async (lang) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;
  }, [i18n]);

  return (
    <TranslationContext.Provider
      value={{
        translateContent,
        translateObject,
        changeLanguage,
        currentLanguage: i18n.language,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslations = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
}; 