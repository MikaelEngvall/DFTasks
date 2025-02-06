import React from "react";
import { useTranslation } from "react-i18next";

const flags = {
  sv: "🇸🇪",
  en: "🇬🇧",
  pl: "🇵🇱",
  uk: "🇺🇦",
};

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(flags).map(([lang, flag]) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`text-2xl transition-transform duration-150 ${
            i18n.language === lang ? "transform scale-125" : "hover:scale-110"
          }`}
          aria-label={`Byt språk till ${lang.toUpperCase()}`}
        >
          {flag}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
