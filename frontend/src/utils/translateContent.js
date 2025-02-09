import i18n from "i18next";

// Använd i18next för översättning
const translateText = async (text, targetLang) => {
  if (!text || typeof text !== "string") return text;

  // Om texten redan finns i översättningarna, använd den
  const translated = i18n.t(text, { lng: targetLang });
  return translated !== text ? translated : text;
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
