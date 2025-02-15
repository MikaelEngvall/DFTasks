import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { formatDistance, formatRelative, formatDuration } from 'date-fns';
import { sv, en, pl, uk } from 'date-fns/locale';

const locales = { sv, en, pl, uk };

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'sv',
    supportedLngs: ['sv', 'en', 'pl', 'uk'],
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    ns: ['common', 'errors', 'tasks', 'auth'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date) {
          const locale = locales[lng];
          
          switch (format) {
            case 'relative':
              return formatRelative(value, new Date(), { locale });
            case 'distance':
              return formatDistance(value, new Date(), { 
                locale,
                addSuffix: true 
              });
            case 'duration':
              return formatDuration(value, { locale });
            default:
              return value.toLocaleString(lng);
          }
        }
        return value;
      }
    }
  });

export default i18n; 