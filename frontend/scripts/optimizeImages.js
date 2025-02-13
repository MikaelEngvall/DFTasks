const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const WIDTHS = [320, 640, 768, 1024, 1280];
const INPUT_DIR = path.join(__dirname, "../public/dftasks");
const OUTPUT_DIR = path.join(__dirname, "../public/dftasks/optimized");

// Skapa output-katalogen om den inte finns
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath) {
  const filename = path.basename(inputPath);
  const nameWithoutExt = filename.split(".").slice(0, -1).join(".");
  const extension = filename.split(".").pop();

  for (const width of WIDTHS) {
    const outputFilename = `${nameWithoutExt}-${width}.${extension}`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    try {
      await sharp(inputPath)
        .resize(width)
        .toFormat(extension === "png" ? "png" : "webp", {
          quality: 80,
          effort: 6,
        })
        .toFile(outputPath);

      console.log(`Genererade ${outputFilename}`);
    } catch (error) {
      console.error(
        `Fel vid optimering av ${filename} till ${width}px:`,
        error
      );
    }
  }
}

async function processImages() {
  try {
    const files = fs.readdirSync(INPUT_DIR);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    console.log(`Hittade ${imageFiles.length} bilder att optimera...`);

    for (const file of imageFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      await optimizeImage(inputPath);
    }

    console.log("Bildoptimering klar!");
  } catch (error) {
    console.error("Ett fel uppstod:", error);
  }
}

processImages();
