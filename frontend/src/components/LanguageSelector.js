import React from "react";
import { useLanguage } from "../context/LanguageContext";

const flags = {
  sv: "🇸🇪",
  en: "🇬🇧",
  pl: "🇵🇱",
  uk: "🇺🇦",
};

function LanguageSelector() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(flags).map(([lang, flag]) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`text-2xl transition-transform duration-150 ${
            currentLanguage === lang ? "transform scale-125" : "hover:scale-110"
          }`}
          title={lang.toUpperCase()}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;
