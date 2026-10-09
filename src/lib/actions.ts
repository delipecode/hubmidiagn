"use server";

import { db } from "@/db";
import { marcas, campanhas, fornecedores, pontosFisicos, midiasCampanha, checkings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureDatabaseReady } from "@/db/bootstrap";

export async function getDashboardData() {
  await ensureDatabaseReady();
  
  const [
    marcasList,
    campanhasList,
    fornecedoresList,
    midiasList,
    pontosList,
    checkingsList,
  ] = await Promise.all([
    db.select().from(marcas),
    db.query.campanhas.findMany({
      with: {
        marca: true,
        midias: {
          with: {
            fornecedor: true,
            pontoFisico: true,
          },
        },
      },
      orderBy: [desc(campanhas.dataFim)],
    }),
    db.select().from(fornecedores),
    db.query.midiasCampanha.findMany({
      with: {
        campanha: true,
        fornecedor: true,
        pontoFisico: true,
        marca: true,
      },
      orderBy: [desc(midiasCampanha.dataFim)],
    }),
    db.query.pontosFisicos.findMany({
      with: {
        fornecedor: true,
        midias: {
          with: {
            campanha: true,
          },
        },
      },
    }),
    db.query.checkings.findMany({
      with: {
        midiaCampanha: {
          with: {
            marca: true,
            campanha: true,
          },
        },
        pontoFisico: true,
      },
      orderBy: [desc(checkings.dataChecagem)],
    }),
  ]);

  return {
    marcas: marcasList,
    campanhas: campanhasList,
    fornecedores: fornecedoresList,
    midias: midiasList,
    pontos: pontosList,
    checkings: checkingsList,
  };
}

export async function getCampanhasCompletas() {
  await ensureDatabaseReady();
  return await db.query.campanhas.findMany({
    with: {
      marca: true,
      midias: {
        with: {
          fornecedor: true,
          pontoFisico: true,
        },
      },
    },
    orderBy: [desc(campanhas.dataFim)],
  });
}

export async function getCampanhaPorId(id: string) {
  await ensureDatabaseReady();
  return await db.query.campanhas.findFirst({
    where: eq(campanhas.id, id),
    with: {
      marca: true,
      midias: {
        with: {
          fornecedor: true,
          pontoFisico: true,
          checkings: true,
        },
      },
    },
  });
}

export async function getPontosParaMapa() {
  await ensureDatabaseReady();
  const [pontos, fornecedoresList, campanhasList] = await Promise.all([
    db.query.pontosFisicos.findMany({
      with: {
        fornecedor: true,
        midias: {
          with: {
            campanha: true,
          },
        },
      },
    }),
    db.select().from(fornecedores),
    db.select().from(campanhas),
  ]);

  return {
    pontos,
    fornecedores: fornecedoresList,
    campanhas: campanhasList,
  };
}

export async function getCentralTerritorialData() {
  await ensureDatabaseReady();
  const [pontos, checkingsList, fornecedoresList, campanhasList] = await Promise.all([
    db.query.pontosFisicos.findMany({
      with: {
        fornecedor: true,
        midias: {
          with: {
            campanha: true,
            marca: true,
          },
        },
        checkings: {
          with: {
            midiaCampanha: {
              with: {
                campanha: true,
                marca: true,
              },
            },
          },
        },
      },
    }),
    db.query.checkings.findMany({
      with: {
        pontoFisico: {
          with: {
            fornecedor: true,
          },
        },
        midiaCampanha: {
          with: {
            campanha: true,
            marca: true,
          },
        },
      },
      orderBy: [desc(checkings.dataChecagem)],
    }),
    db.select().from(fornecedores),
    db.select().from(campanhas),
  ]);

  return {
    pontos,
    checkings: checkingsList,
    fornecedores: fornecedoresList,
    campanhas: campanhasList,
  };
}

export async function getFornecedoresComMidias() {
  return await db.query.fornecedores.findMany({
    with: {
      midias: {
        with: {
          campanha: true,
          marca: true,
          pontoFisico: true,
          checkings: true,
        },
      },
      pontosFisicos: {
        with: {
          midias: {
            with: {
              campanha: true,
              marca: true,
            },
          },
        },
      },
    },
  });
}

export async function criarCampanha(formData: {
  marcaId: string;
  nome: string;
  objetivo?: string;
  dataInicio: string;
  dataFim: string;
  status?: string;
  orcamentoTotal?: number;
}) {
  const id = `CAMP-${formData.marcaId}-${Date.now()}`;
  
  await db.insert(campanhas).values({
    id,
    marcaId: formData.marcaId,
    nome: formData.nome,
    objetivo: formData.objetivo,
    dataInicio: formData.dataInicio,
    dataFim: formData.dataFim,
    status: formData.status || "Ativa",
    orcamentoTotal: formData.orcamentoTotal,
  });

  revalidatePath("/campanhas");
  revalidatePath("/dashboard");
  revalidatePath("/pontos");
  return { success: true, id };
}

export async function editarCampanha(
  id: string,
  formData: {
    marcaId: string;
    nome: string;
    objetivo?: string;
    dataInicio: string;
    dataFim: string;
    status?: string;
    orcamentoTotal?: number;
  }
) {
  await db
    .update(campanhas)
    .set({
      marcaId: formData.marcaId,
      nome: formData.nome,
      objetivo: formData.objetivo,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      status: formData.status || "Ativa",
      orcamentoTotal: formData.orcamentoTotal,
    })
    .where(eq(campanhas.id, id));

  revalidatePath("/campanhas");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/");

  return { success: true };
}

export async function excluirCampanha(id: string) {
  const midias = await db
    .select({ id: midiasCampanha.id, pontoFisicoId: midiasCampanha.pontoFisicoId })
    .from(midiasCampanha)
    .where(eq(midiasCampanha.campanhaId, id));

  for (const m of midias) {
    await db.delete(checkings).where(eq(checkings.midiaCampanhaId, m.id));
    if (m.pontoFisicoId) {
      await db
        .update(pontosFisicos)
        .set({ statusPonto: "Disponível / Mapeado" })
        .where(eq(pontosFisicos.id, m.pontoFisicoId));
    }
  }

  await db.delete(midiasCampanha).where(eq(midiasCampanha.campanhaId, id));
  await db.delete(campanhas).where(eq(campanhas.id, id));

  revalidatePath("/campanhas");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/");

  return { success: true };
}

export async function adicionarMidiaCampanha(formData: {
  campanhaId: string;
  marcaId: string;
  fornecedorId: string;
  pontoFisicoId?: string | null;
  categoriaMidia: string;
  subtipoMidia: string;
  formatoPeca: string;
  biSemana?: string;
  dataInicio: string;
  dataFim: string;
  statusVeiculacao?: string;
  tipoAcaoFinal?: string;
  valorNegociado?: number;
  numPI?: string;
  observacoes?: string;
}) {
  const id = `MID-${Date.now()}`;

  await db.insert(midiasCampanha).values({
    id,
    campanhaId: formData.campanhaId,
    marcaId: formData.marcaId,
    fornecedorId: formData.fornecedorId,
    pontoFisicoId: formData.pontoFisicoId || null,
    categoriaMidia: formData.categoriaMidia || "OFFLINE",
    subtipoMidia: formData.subtipoMidia || "OUTDOOR_BISEMANA",
    formatoPeca: formData.formatoPeca,
    tipoRegraPrazo: formData.biSemana ? "BISEMANA_FIXA" : "MANUAL_DATAS",
    biSemana: formData.biSemana || null,
    dataInicio: formData.dataInicio,
    dataFim: formData.dataFim,
    statusVeiculacao: formData.statusVeiculacao || "No Ar / Ativo",
    tipoAcaoFinal: formData.tipoAcaoFinal || "Renovação Contrato",
    valorNegociado: formData.valorNegociado,
    numPI: formData.numPI,
    observacoes: formData.observacoes,
  });

  if (formData.pontoFisicoId) {
    await db
      .update(pontosFisicos)
      .set({ statusPonto: "Comprado / Ativo" })
      .where(eq(pontosFisicos.id, formData.pontoFisicoId));
  }

  revalidatePath("/campanhas");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/");

  return { success: true, id };
}

export async function excluirMidiaCampanha(midiaId: string) {
  const midia = await db.query.midiasCampanha.findFirst({
    where: eq(midiasCampanha.id, midiaId),
  });

  await db.delete(checkings).where(eq(checkings.midiaCampanhaId, midiaId));
  await db.delete(midiasCampanha).where(eq(midiasCampanha.id, midiaId));

  if (midia?.pontoFisicoId) {
    const outrasMidias = await db
      .select()
      .from(midiasCampanha)
      .where(eq(midiasCampanha.pontoFisicoId, midia.pontoFisicoId));
    if (outrasMidias.length === 0) {
      await db
        .update(pontosFisicos)
        .set({ statusPonto: "Disponível / Mapeado" })
        .where(eq(pontosFisicos.id, midia.pontoFisicoId));
    }
  }

  revalidatePath("/campanhas");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/");

  return { success: true };
}

export async function criarFornecedor(formData: {
  nome: string;
  categoriaGeral: "OFFLINE" | "DIGITAL";
  tipoVeiculo: string;
  praca?: string;
  contatoNome?: string;
  whatsapp?: string;
  email?: string;
  prazoEntregaDias?: number;
  specsTecnicas?: string;
  observacoes?: string;
}) {
  const id = `FORN-${Date.now()}`;

  await db.insert(fornecedores).values({
    id,
    nome: formData.nome,
    categoriaGeral: formData.categoriaGeral || "OFFLINE",
    tipoVeiculo: formData.tipoVeiculo,
    praca: formData.praca || "Feira de Santana",
    contatoNome: formData.contatoNome,
    whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, "") : undefined,
    email: formData.email,
    prazoEntregaDias: formData.prazoEntregaDias || 2,
    specsTecnicas: formData.specsTecnicas,
    observacoes: formData.observacoes,
  });

  revalidatePath("/fornecedores");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/");

  return { success: true, id };
}

export async function criarPontoFisicoComMidia(formData: {
  fornecedorId: string;
  codigoIdentificador: string;
  nomeLocal: string;
  tipoFormato: string;
  praca: string;
  bairro: string;
  endereco: string;
  latitude: number;
  longitude: number;
  fotoLocalUrl?: string;
  statusPonto: string;
  // Opcional: vincular a campanha
  vincularCampanha?: boolean;
  campanhaId?: string;
  marcaId?: string;
  biSemana?: string;
  dataInicio?: string;
  dataFim?: string;
  tipoAcaoFinal?: string;
  valorNegociado?: number;
  numPI?: string;
}) {
  const pontoId = `PONTO-${Date.now()}`;

  // 1. Insere o ponto físico
  await db.insert(pontosFisicos).values({
    id: pontoId,
    fornecedorId: formData.fornecedorId,
    codigoIdentificador: formData.codigoIdentificador,
    nomeLocal: formData.nomeLocal,
    tipoFormato: formData.tipoFormato,
    praca: formData.praca || "Feira de Santana",
    bairro: formData.bairro,
    endereco: formData.endereco,
    latitude: formData.latitude,
    longitude: formData.longitude,
    fotoLocalUrl: formData.fotoLocalUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    statusPonto: formData.vincularCampanha ? "Comprado / Ativo" : formData.statusPonto,
  });

  // 2. Se o usuário marcou para vincular a uma campanha
  if (formData.vincularCampanha && formData.campanhaId && formData.marcaId) {
    const midiaId = `MIDIA-${Date.now()}`;
    await db.insert(midiasCampanha).values({
      id: midiaId,
      campanhaId: formData.campanhaId,
      marcaId: formData.marcaId,
      fornecedorId: formData.fornecedorId,
      pontoFisicoId: pontoId,
      categoriaMidia: "OFFLINE",
      subtipoMidia: formData.tipoFormato.includes("Outdoor")
        ? "OUTDOOR_BISEMANA"
        : formData.tipoFormato.includes("Academia")
        ? "INDOOR_ACADEMIA"
        : formData.tipoFormato.includes("LED")
        ? "LED_DIGITAL"
        : "OUTDOOR_BISEMANA",
      formatoPeca: formData.tipoFormato,
      tipoRegraPrazo: formData.biSemana ? "BISEMANA_FIXA" : "MANUAL_DATAS",
      biSemana: formData.biSemana || "Mensal",
      dataInicio: formData.dataInicio || new Date().toISOString().split("T")[0],
      dataFim: formData.dataFim || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      statusVeiculacao: "No Ar / Ativo",
      tipoAcaoFinal: formData.tipoAcaoFinal || "Troca de Lona/Adesivo",
      numPI: formData.numPI,
      valorNegociado: formData.valorNegociado,
    });
  }

  revalidatePath("/mapa");
  revalidatePath("/pontos");
  revalidatePath("/campanhas");
  revalidatePath("/");

  return { success: true, id: pontoId };
}
