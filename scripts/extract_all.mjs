import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

// Find directory with case/accent tolerance
const baseDir = "E:\\Antigravity Google";
const allDirs = fs.readdirSync(baseDir);
const docsDirName = allDirs.find((d) => d.toLowerCase().includes("docs") && d.toLowerCase().includes("dia"));
const docsDir = path.join(baseDir, docsDirName);

console.log("Diretório encontrado:", docsDir);
const files = fs.readdirSync(docsDir);
console.log("Arquivos encontrados:", files);

async function main() {
  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    console.log(`\n==========================================`);
    console.log(`Processando: ${file}`);
    console.log(`==========================================`);

    if (file.endsWith(".pdf")) {
      const buffer = fs.readFileSync(fullPath);
      const parser = new PDFParse(new Uint8Array(buffer));
      await parser.load();
      const res = await parser.getText();
      const outName = `scripts/${file.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      fs.writeFileSync(outName, res.text);
      console.log(`PDF extraído -> ${outName} | Total chars: ${res.text.length} | Páginas: ${res.total}`);
    } else if (file.endsWith(".docx")) {
      const zip = new AdmZip(fullPath);
      const xml = zip.readAsText("word/document.xml");
      const cleanDocx = xml
        .replace(/<w:p[^>]*>/g, "\n[P] ")
        .replace(/<w:tr[^>]*>/g, "\n[TR] ")
        .replace(/<w:tc[^>]*>/g, " | ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ");
      const outName = `scripts/${file.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      fs.writeFileSync(outName, cleanDocx);
      console.log(`DOCX extraído -> ${outName} | Total chars: ${cleanDocx.length}`);
    } else if (file.endsWith(".csv")) {
      console.log(`CSV fornecedores identificado.`);
    }
  }
}

main().catch(console.error);
