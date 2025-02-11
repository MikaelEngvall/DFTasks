import mongoose from "mongoose";
import { config } from "dotenv";
import Task from "../models/Task.js";
import fetch from "node-fetch";

config();

const translateComment = async (content, targetLang) => {
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: content,
          target: targetLang,
          format: "text",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation error: ${await response.text()}`);
    }

    const data = await response.json();
    return data.data?.translations?.[0]?.translatedText;
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
    return null;
  }
};

const migrateComments = async () => {
  try {
    // Anslut till MongoDB
    console.log("Ansluter till MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Ansluten till MongoDB");

    // Hämta alla uppgifter med kommentarer
    const tasks = await Task.find({ "comments.0": { $exists: true } });
    console.log(`Hittade ${tasks.length} uppgifter med kommentarer`);

    const targetLanguages = ["sv", "pl", "uk"];
    let totalComments = 0;
    let translatedComments = 0;

    // Gå igenom varje uppgift
    for (const task of tasks) {
      console.log(`\nBearbetar uppgift: ${task.title}`);

      // Gå igenom varje kommentar
      for (const comment of task.comments) {
        totalComments++;
        console.log(
          `\nÖversätter kommentar: ${comment.content.substring(0, 50)}...`
        );

        // Skapa translations-objekt om det inte finns
        if (!comment.translations) {
          comment.translations = {
            en: comment.content, // Originalspråket (engelska)
          };
        }

        // Översätt till varje målspråk
        for (const lang of targetLanguages) {
          if (!comment.translations[lang]) {
            console.log(`Översätter till ${lang}...`);
            const translatedText = await translateComment(
              comment.content,
              lang
            );

            if (translatedText) {
              comment.translations[lang] = translatedText;
              translatedComments++;
              console.log(
                `Översatt till ${lang}: ${translatedText.substring(0, 50)}...`
              );
            }

            // Vänta lite mellan varje översättning för att undvika API-begränsningar
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // Spara uppdaterad uppgift
      await task.save();
      console.log("Uppgift sparad med översatta kommentarer");
    }

    console.log("\nMigrering slutförd!");
    console.log(`Totalt antal kommentarer: ${totalComments}`);
    console.log(`Antal översatta kommentarer: ${translatedComments}`);

    process.exit(0);
  } catch (error) {
    console.error("Fel vid migrering:", error);
    process.exit(1);
  }
};

// Kör migreringen
migrateComments();
