import axios from "axios";

const GOOGLE_TRANSLATE_API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;

// Använd Google Cloud Translation API eller liknande för att översätta text
const translateText = async (text, targetLang) => {
  if (!text) return text;

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLang,
        format: "text",
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Returnera originaltexten vid fel
  }
};

export const translateContent = async (content, targetLang) => {
  if (!content) return content;

  // Om innehållet är en sträng
  if (typeof content === "string") {
    return await translateText(content, targetLang);
  }

  // Om innehållet är ett objekt (t.ex. en uppgift)
  if (typeof content === "object") {
    const translatedContent = { ...content };

    // Fält som inte ska översättas
    const excludeFields = [
      "_id",
      "id",
      "name",
      "email",
      "createdAt",
      "updatedAt",
      "assignedTo",
      "createdBy",
    ];

    for (const key in translatedContent) {
      if (!excludeFields.includes(key)) {
        if (typeof translatedContent[key] === "string") {
          translatedContent[key] = await translateText(
            translatedContent[key],
            targetLang
          );
        }
      }
    }

    // Hantera kommentarer separat
    if (
      translatedContent.comments &&
      Array.isArray(translatedContent.comments)
    ) {
      translatedContent.comments = await Promise.all(
        translatedContent.comments.map(async (comment) => ({
          ...comment,
          content: await translateText(comment.content, targetLang),
        }))
      );
    }

    return translatedContent;
  }

  return content;
};
