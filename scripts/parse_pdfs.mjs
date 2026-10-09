import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParsePkg = require("pdf-parse");
const pdfParse = typeof pdfParsePkg === "function" ? pdfParsePkg : pdfParsePkg.default || pdfParsePkg;

console.log("pdfParse type:", typeof pdfParse, Object.keys(pdfParsePkg));

const docsDir = "E:\\Antigravity Google\\DOCS MÍDIA";

async function main() {
  const henkleyPdf = path.join(docsDir, "HENKLEY - TELAS INDOOR 2026.pdf");
  if (fs.existsSync(henkleyPdf)) {
    const dataBuffer = fs.readFileSync(henkleyPdf);
    const data = await pdfParse(dataBuffer);
    console.log("=== HENKLEY PDF (Total pág:", data.numpages, ") ===");
    console.log(data.text);
    fs.writeFileSync("scripts/henkley_parsed.txt", data.text);
  }

  const midiaKitPdf = path.join(docsDir, "MÍDIA KIT FEIRA DE SANTANA-BA.pdf");
  if (fs.existsSync(midiaKitPdf)) {
    const dataBuffer = fs.readFileSync(midiaKitPdf);
    const data = await pdfParse(dataBuffer);
    console.log("=== MIDIA KIT PDF (Total pág:", data.numpages, ") ===");
    console.log(data.text.substring(0, 5000));
    fs.writeFileSync("scripts/midia_kit_parsed.txt", data.text);
  }
}

main().catch(console.error);
