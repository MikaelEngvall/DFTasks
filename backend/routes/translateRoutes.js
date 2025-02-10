import express from "express";
const router = express.Router();
import fetch from "node-fetch";

router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      return res
        .status(400)
        .json({ error: "No Google Translate API key configured" });
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
          target: targetLang.toLowerCase(),
          format: "text",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();

    if (data.data && data.data.translations && data.data.translations[0]) {
      res.json({
        translations: [{ text: data.data.translations[0].translatedText }],
      });
    } else {
      throw new Error("Invalid translation response");
    }
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      error: "Translation failed",
      details: error.message,
      stack: error.stack,
    });
  }
});

export default router;
