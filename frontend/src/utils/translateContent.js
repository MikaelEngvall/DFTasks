import i18n from "i18next";

// Använd i18next för översättning
const translateText = async (text, targetLang) => {
  if (!text || typeof text !== "string") return text;

  // Om texten redan finns i översättningarna, använd den
  const translated = i18n.t(text, { lng: targetLang });

  // Om översättningen är samma som originaltexten, returnera originalet
  if (translated === text) {
    return text;
  }

  return translated;
};

export const translateContent = async (content, targetLang) => {
  // Om content är en sträng, översätt direkt
  if (typeof content === "string") {
    return await translateText(content, targetLang);
  }

  // Om content inte är ett objekt eller är null, returnera som det är
  if (!content || typeof content !== "object") {
    return content;
  }

  // Om det är ett objekt, returnera det oförändrat
  return content;
};
