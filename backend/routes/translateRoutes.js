const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "No DeepL API key configured" });
    }

    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router;
