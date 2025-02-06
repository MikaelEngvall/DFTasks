import React from "react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";

const countryFlags = {
  en: "GB",
  pl: "PL",
  sv: "SE",
  uk: "UA",
};

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(countryFlags).map(([lang, country]) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`transition-transform duration-150 ${
            i18n.language === lang ? "transform scale-125" : "hover:scale-110"
          }`}
          aria-label={`Byt språk till ${lang.toUpperCase()}`}
        >
          <ReactCountryFlag
            countryCode={country}
            svg
            style={{
              width: "2em",
              height: "2em",
            }}
            title={country}
          />
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
