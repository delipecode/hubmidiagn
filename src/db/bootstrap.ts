import { client, db } from "./index";
import { importFullData } from "./import_full_docs";
import { semearPontosRegionais } from "./seed_regionais";
import { sincronizarCatalogoCompleto } from "./seed_catalogo_completo";
import { marcas } from "./schema";

let isBootstrapping = false;
let isBootstrapped = false;

export async function ensureDatabaseReady() {
  if (isBootstrapped) return;
  if (isBootstrapping) return;

  isBootstrapping = true;

  try {
    // Verificação rápida: se a tabela marcas já existir e tiver dados, verifica praças regionais e encerra
    try {
      const checagem = await client.execute("SELECT id FROM marcas LIMIT 1;");
      if (checagem.rows && checagem.rows.length > 0) {
        // Garante que a coluna marcas_multiplas exista
        try {
          await client.execute("ALTER TABLE campanhas ADD COLUMN marcas_multiplas TEXT;");
        } catch {
          // Coluna já existe
        }

        // Garante que a coluna data_contrato exista
        try {
          await client.execute("ALTER TABLE midias_campanha ADD COLUMN data_contrato TEXT;");
        } catch {
          // Coluna já existe
        }

        // Verifica se todos os pontos do catálogo já foram sincronizados (mínimo de 70 pontos)
        try {
          const checagemPontos = await client.execute("SELECT count(*) as total FROM pontos_fisicos;");
          const totalPontos = Number(checagemPontos.rows[0]?.total ?? 0);
          if (totalPontos < 70) {
            await semearPontosRegionais();
            await sincronizarCatalogoCompleto();
          }
        } catch (e) {
          console.error("Aviso ao checar pontos do catálogo:", e);
        }

        isBootstrapped = true;
        isBootstrapping = false;
        return;
      }
    } catch {
      // Tabela não existe ainda, prosseguir para a criação
    }

    // 1. Criar tabelas se não existirem
    await client.execute(`
      CREATE TABLE IF NOT EXISTS marcas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cor_hex TEXT NOT NULL,
        cor_bg TEXT NOT NULL,
        cor_border TEXT NOT NULL,
        cor_text TEXT NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria_geral TEXT NOT NULL DEFAULT 'OFFLINE',
        tipo_veiculo TEXT NOT NULL,
        praca TEXT NOT NULL DEFAULT 'Feira de Santana',
        contato_nome TEXT,
        whatsapp TEXT,
        email TEXT,
        prazo_entrega_dias INTEGER DEFAULT 2,
        specs_tecnicas TEXT,
        observacoes TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS pontos_fisicos (
        id TEXT PRIMARY KEY,
        fornecedor_id TEXT NOT NULL REFERENCES fornecedores(id),
        codigo_identificador TEXT,
        nome_local TEXT NOT NULL,
        tipo_formato TEXT NOT NULL,
        praca TEXT NOT NULL DEFAULT 'Feira de Santana',
        bairro TEXT NOT NULL,
        endereco TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        foto_local_url TEXT,
        status_ponto TEXT NOT NULL DEFAULT 'Disponível / Mapeado',
        observacoes TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS campanhas (
        id TEXT PRIMARY KEY,
        marca_id TEXT NOT NULL REFERENCES marcas(id),
        nome TEXT NOT NULL,
        objetivo TEXT,
        data_inicio TEXT NOT NULL,
        data_fim TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Ativa',
        orcamento_total REAL,
        cor_destaque TEXT,
        marcas_multiplas TEXT
      );
    `);

    try {
      await client.execute("ALTER TABLE campanhas ADD COLUMN marcas_multiplas TEXT;");
    } catch {
      // Coluna já existe
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS midias_campanha (
        id TEXT PRIMARY KEY,
        campanha_id TEXT NOT NULL REFERENCES campanhas(id),
        marca_id TEXT NOT NULL REFERENCES marcas(id),
        fornecedor_id TEXT NOT NULL REFERENCES fornecedores(id),
        ponto_fisico_id TEXT REFERENCES pontos_fisicos(id),
        categoria_midia TEXT NOT NULL DEFAULT 'OFFLINE',
        subtipo_midia TEXT NOT NULL,
        formato_peca TEXT NOT NULL,
        tipo_regra_prazo TEXT NOT NULL DEFAULT 'MANUAL_DATAS',
        bi_semana TEXT,
        data_inicio TEXT NOT NULL,
        data_fim TEXT NOT NULL,
        deadline_material TEXT,
        status_veiculacao TEXT NOT NULL DEFAULT 'No Ar / Ativo',
        tipo_acao_final TEXT DEFAULT 'Renovação Contrato',
        num_pi TEXT,
        data_contrato TEXT,
        valor_negociado REAL,
        link_material_drive TEXT,
        observacoes TEXT
      );
    `);

    try {
      await client.execute("ALTER TABLE midias_campanha ADD COLUMN data_contrato TEXT;");
    } catch {
      // Coluna já existe
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS checkings (
        id TEXT PRIMARY KEY,
        midia_campanha_id TEXT REFERENCES midias_campanha(id),
        ponto_fisico_id TEXT REFERENCES pontos_fisicos(id),
        data_checagem TEXT NOT NULL,
        foto_checking_url TEXT,
        status TEXT NOT NULL DEFAULT 'Recebido',
        observacoes TEXT
      );
    `);

    // 2. Checar se o banco já foi populado com as marcas
    const marcasExistentes = await db.select().from(marcas);
    if (marcasExistentes.length === 0) {
      console.log("🌱 Banco novo detectado no Turso/SQLite. Populando catálogo oficial...");
      await importFullData();
      await semearPontosRegionais();
      await sincronizarCatalogoCompleto();
      console.log("✅ Catálogo oficial, praças regionais e pontos completos importados com sucesso!");
    }

    isBootstrapped = true;
  } catch (err) {
    console.error("⚠️ Erro no auto-bootstrap do banco:", err);
  } finally {
    isBootstrapping = false;
  }
}
