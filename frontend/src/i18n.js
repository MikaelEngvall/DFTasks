import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./i18n/locales/en.json";
import svTranslations from "./i18n/locales/sv.json";
import plTranslations from "./i18n/locales/pl.json";
import ukTranslations from "./i18n/locales/uk.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  sv: {
    translation: svTranslations,
  },
  pl: {
    translation: plTranslations,
  },
  uk: {
    translation: ukTranslations,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "sv", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
