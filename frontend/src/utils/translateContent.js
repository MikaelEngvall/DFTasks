import i18n from "i18next";
import axiosInstance from "./axios";

// Använd Google Translate API för översättning av dynamiskt innehåll
const translateText = async (text, targetLang) => {
  if (!text || typeof text !== "string") return text;

  try {
    const response = await axiosInstance.post("/translate", {
      text,
      targetLang: targetLang.toLowerCase(),
    });

    if (
      response.data &&
      response.data.translations &&
      response.data.translations[0]
    ) {
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
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

  // Översätt kommentarer om de finns
  if (content.comments && Array.isArray(content.comments)) {
    translatedContent.comments = await Promise.all(
      content.comments.map(async (comment) => ({
        ...comment,
        content: await translateText(comment.content, targetLang),
        _translated: true,
        _translatedLang: targetLang,
      }))
    );
  }

  // Markera hela objektet som översatt
  translatedContent._translated = true;
  translatedContent._translatedLang = targetLang;

  return translatedContent;
};
