import i18n from "i18next";

// Använd i18next för översättning
const translateText = async (text, targetLang) => {
  if (!text || typeof text !== "string") return text;

  // Om texten redan finns i översättningarna, använd den
  const translated = i18n.t(text, { lng: targetLang });
  if (translated !== text) {
    return translated;
  }

  // Om ingen översättning finns, använd Google Translate API
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.warn("No Google Translate API key found");
      return text;
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
        }),
      }
    );

    const data = await response.json();
    if (data.data && data.data.translations && data.data.translations[0]) {
      return data.data.translations[0].translatedText;
    }
  } catch (error) {
    console.error("Translation error:", error);
  }

  return text;
};

export const translateContent = async (content, targetLang) => {
  if (typeof content === "string") {
    return await translateText(content, targetLang);
  }

  if (!content || typeof content !== "object") {
    return content;
  }

  // Om det är ett objekt med title och description, översätt båda
  const translatedContent = { ...content };
  if (content.title) {
    translatedContent.title = await translateText(content.title, targetLang);
  }
  if (content.description) {
    translatedContent.description = await translateText(
      content.description,
      targetLang
    );
  }

  return translatedContent;
};
