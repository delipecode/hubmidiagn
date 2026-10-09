import { importFullData } from "./import_full_docs";

async function seed() {
  console.log("🌱 Executando seed oficial dos dados de DOCS MÍDIA...");
  await importFullData();
  console.log("✅ Seed concluído com sucesso!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
