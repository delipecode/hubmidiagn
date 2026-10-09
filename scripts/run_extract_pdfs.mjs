import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const docsDir = "E:\\Antigravity Google\\DOCS MÍDIA";

async function extractPdf(filename) {
  const filePath = path.join(docsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log("Arquivo não encontrado:", filename);
    return "";
  }
  const buffer = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buffer);
  const parser = new PDFParse(uint8);
  await parser.load();
  const text = await parser.getText();
  return text;
}

async function main() {
  console.log("--- EXTRAINDO HENKLEY ---");
  const henkleyText = await extractPdf("HENKLEY - TELAS INDOOR 2026.pdf");
  fs.writeFileSync("scripts/henkley_text.txt", henkleyText);
  console.log("HENKLEY TEXT (len: " + henkleyText.length + "):\n", henkleyText);

  console.log("\n--- EXTRAINDO MIDIA KIT FEIRA DE SANTANA ---");
  const midiaKitText = await extractPdf("MÍDIA KIT FEIRA DE SANTANA-BA.pdf");
  fs.writeFileSync("scripts/midia_kit_text.txt", midiaKitText);
  console.log("MIDIA KIT TEXT (len: " + midiaKitText.length + "):\n", midiaKitText.substring(0, 4000));
}

main().catch(console.error);
