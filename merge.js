import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  try {
    const { photo_url, filter_url } = req.body;
    if (!photo_url || !filter_url) {
      return res.status(400).json({ error: "photo_url and filter_url are required" });
    }

    const tmpDir = "/tmp";
    const photoPath = path.join(tmpDir, "photo.jpg");
    const filterPath = path.join(tmpDir, "filter.png");
    const outputPath = path.join(tmpDir, "output.png");

    const download = async (url, dest) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buffer));
    };

    await download(photo_url, photoPath);
    await download(filter_url, filterPath);

    execSync(
      `convert "${photoPath}" -resize 800x800 "${filterPath}" -gravity center -composite "${outputPath}"`
    );

    const imgBase64 = fs.readFileSync(outputPath, { encoding: "base64" });
    res.json({ success: true, image_base64: imgBase64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
