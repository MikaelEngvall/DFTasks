import { useState, useEffect } from 'react';
import { useTranslations } from '../providers/TranslationProvider';
import { useData } from './useData';

export const useTranslatedContent = (content, options = {}) => {
  const { currentLanguage, translateContent } = useTranslations();
  const [translatedContent, setTranslatedContent] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);

  const {
    autoTranslate = true,
    dependencies = [],
    onTranslated,
  } = options;

  const { data: translation, loading, error } = useData(
    `translation_${content}_${currentLanguage}`,
    () => translateContent(content, currentLanguage),
    {
      enabled: autoTranslate && !!content,
      dependencies: [content, currentLanguage, ...dependencies],
    }
  );

  useEffect(() => {
    if (translation) {
      setTranslatedContent(translation);
      onTranslated?.(translation);
    }
  }, [translation, onTranslated]);

  const translate = async (targetLang) => {
    try {
      setIsTranslating(true);
      const translated = await translateContent(content, targetLang);
      setTranslatedContent(translated);
      return translated;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translatedContent,
    isTranslating: loading || isTranslating,
    error,
    translate,
  };
}; 