import i18n from "i18next";

// Använd i18next för översättning istället för Google Translate
const translateText = async (text, targetLang) => {
  if (!text) return text;

  // Om texten redan finns i översättningarna, använd den
  const translated = i18n.t(text, { lng: targetLang });

  // Om översättningen är samma som originaltexten, returnera originalet
  if (translated === text) {
    return text;
  }

  return translated;
};

export const translateContent = async (content, targetLang) => {
  if (!content) return content;

  // Om innehållet är en sträng
  if (typeof content === "string") {
    return await translateText(content, targetLang);
  }

  // Om innehållet är ett objekt
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
