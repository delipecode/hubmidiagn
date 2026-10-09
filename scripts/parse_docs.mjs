import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const docsDir = "E:\\Antigravity Google\\DOCS MÍDIA";

async function main() {
  console.log("=== INICIANDO LEITURA DOS DOCUMENTOS DE MÍDIA ===");

  // 1. LER DOCX (catalogo_outdoors)
  const docxFile = path.join(docsDir, "catalogo_outdoors (1) (1).docx");
  if (fs.existsSync(docxFile)) {
    console.log("\n==========================================");
    console.log("📄 1. CATALOGO OUTDOORS (.docx)");
    console.log("==========================================");
    try {
      const zip = new AdmZip(docxFile);
      const xml = zip.readAsText("word/document.xml");
      // Extrair textos estruturados
      const cleanText = xml
        .replace(/<w:p[^>]*>/g, "\n[PARAGRAFO] ")
        .replace(/<w:tr[^>]*>/g, "\n[LINHA_TABELA] ")
        .replace(/<w:tc[^>]*>/g, " | ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .replace(/\[PARAGRAFO\]/g, "\n")
        .replace(/\[LINHA_TABELA\]/g, "\n[TABELA]");

      console.log("Comprimento total do texto extraído:", cleanText.length);
      fs.writeFileSync("scripts/catalogo_outdoors_raw.txt", cleanText);
      console.log("Amostra do texto (primeiros 3000 caracteres):");
      console.log(cleanText.substring(0, 3000));
    } catch (e) {
      console.error("Erro ao ler DOCX:", e);
    }
  }

  // 2. LER PDF HENKLEY
  const henkleyPdf = path.join(docsDir, "HENKLEY - TELAS INDOOR 2026.pdf");
  if (fs.existsSync(henkleyPdf)) {
    console.log("\n==========================================");
    console.log("📄 2. HENKLEY - TELAS INDOOR 2026 (.pdf)");
    console.log("==========================================");
    try {
      const dataBuffer = fs.readFileSync(henkleyPdf);
      const data = await pdfParse(dataBuffer);
      console.log("Total de páginas:", data.numpages);
      fs.writeFileSync("scripts/henkley_raw.txt", data.text);
      console.log("Texto extraído:");
      console.log(data.text);
    } catch (e) {
      console.error("Erro ao ler PDF Henkley:", e);
    }
  }

  // 3. LER PDF MÍDIA KIT FEIRA DE SANTANA
  const midiaKitPdf = path.join(docsDir, "MÍDIA KIT FEIRA DE SANTANA-BA.pdf");
  if (fs.existsSync(midiaKitPdf)) {
    console.log("\n==========================================");
    console.log("📄 3. MÍDIA KIT FEIRA DE SANTANA-BA (.pdf)");
    console.log("==========================================");
    try {
      const dataBuffer = fs.readFileSync(midiaKitPdf);
      const data = await pdfParse(dataBuffer);
      console.log("Total de páginas:", data.numpages);
      fs.writeFileSync("scripts/midia_kit_raw.txt", data.text);
      console.log("Texto extraído (primeiros 4000 caracteres):");
      console.log(data.text.substring(0, 4000));
    } catch (e) {
      console.error("Erro ao ler PDF Mídia Kit:", e);
    }
  }
}

main();
