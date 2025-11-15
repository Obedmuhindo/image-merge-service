import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function handler(req, res) {
  // Vérifie que la méthode HTTP est POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  try {
    const { photo_url, filter_url } = req.body;

    if (!photo_url || !filter_url) {
      return res.status(400).json({ error: "photo_url and filter_url are required" });
    }

    // Crée un dossier temporaire
    const tmpDir = "/tmp";
    const photoPath = path.join(tmpDir, "photo.jpg");
    const filterPath = path.join(tmpDir, "filter.png");
    const outputPath = path.join(tmpDir, "output.png");

    // Fonction pour télécharger une image depuis une URL
    const download = async (url, dest) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buffer));
    };

    // Télécharge les deux images
    await download(photo_url, photoPath);
    await download(filter_url, filterPath);

    // Utilise ImageMagick pour fusionner les images
    execSync(
      `convert "${photoPath}" -resize 800x800 "${filterPath}" -gravity center -composite "${outputPath}"`
    );

    // Lis l'image finale et renvoie en base64
    const imgBase64 = fs.readFileSync(outputPath, { encoding: "base64" });
    res.json({
      success: true,
      message: "Image fusionnée avec succès !",
      image_base64: imgBase64
    });

  } catch (err) {
    console.error("Erreur de fusion :", err);
    res.status(500).json({ error: err.message });
  }
}
