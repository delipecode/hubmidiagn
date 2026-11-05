"use server";

import { db } from "@/db";
import { marcas, campanhas, fornecedores, pontosFisicos, midiasCampanha, checkings } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
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
  await ensureDatabaseReady();
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
  marcaId?: string;
  marcasIds?: string[];
  modoMultiplo?: "UNIFICADA" | "INDIVIDUAL";
  nome: string;
  objetivo?: string;
  dataInicio: string;
  dataFim: string;
  status?: string;
  orcamentoTotal?: number;
}) {
  const marcasList = formData.marcasIds && formData.marcasIds.length > 0
    ? formData.marcasIds
    : [formData.marcaId || "UNEF"];

  const modo = formData.modoMultiplo || "UNIFICADA";

  if (marcasList.length > 1 && modo === "INDIVIDUAL") {
    // Cria uma campanha individual para cada marca selecionada
    const orcamentoPorCampanha = formData.orcamentoTotal
      ? Number((formData.orcamentoTotal / marcasList.length).toFixed(2))
      : undefined;

    const idsCriados: string[] = [];

    for (const m of marcasList) {
      const id = `CAMP-${m}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const nomeCampanha = `${formData.nome} (${m})`;

      await db.insert(campanhas).values({
        id,
        marcaId: m,
        nome: nomeCampanha,
        objetivo: formData.objetivo,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        status: formData.status || "Ativa",
        orcamentoTotal: orcamentoPorCampanha,
        marcasMultiplas: m,
      });
      idsCriados.push(id);
    }

    revalidatePath("/campanhas");
    revalidatePath("/dashboard");
    revalidatePath("/pontos");
    return { success: true, ids: idsCriados, totalCriadas: idsCriados.length };
  } else {
    // Campanha única (unificada com as marcas selecionadas ou marca única)
    const marcaPrincipal = marcasList[0] || "UNEF";
    const marcasStr = marcasList.join(", ");
    const id = `CAMP-${marcaPrincipal}-${Date.now()}`;

    await db.insert(campanhas).values({
      id,
      marcaId: marcaPrincipal,
      nome: formData.nome,
      objetivo: formData.objetivo,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      status: formData.status || "Ativa",
      orcamentoTotal: formData.orcamentoTotal,
      marcasMultiplas: marcasStr,
    });

    revalidatePath("/campanhas");
    revalidatePath("/dashboard");
    revalidatePath("/pontos");
    return { success: true, id };
  }
}

export async function editarCampanha(
  id: string,
  formData: {
    marcaId: string;
    marcasMultiplas?: string;
    marcasIds?: string[];
    nome: string;
    objetivo?: string;
    dataInicio: string;
    dataFim: string;
    status?: string;
    orcamentoTotal?: number;
  }
) {
  const marcasList = formData.marcasIds && formData.marcasIds.length > 0
    ? formData.marcasIds
    : (formData.marcasMultiplas || formData.marcaId).split(",").map(m => m.trim()).filter(Boolean);

  const marcaPrincipal = marcasList[0] || formData.marcaId || "UNEF";
  const marcasStr = marcasList.join(", ");

  await db
    .update(campanhas)
    .set({
      marcaId: marcaPrincipal,
      marcasMultiplas: marcasStr,
      nome: formData.nome,
      objetivo: formData.objetivo,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      status: formData.status || "Ativa",
      orcamentoTotal: formData.orcamentoTotal,
    })
    .where(eq(campanhas.id, id));

  // Atualizar marcaId em todas as mídias da campanha
  await db
    .update(midiasCampanha)
    .set({ marcaId: marcaPrincipal })
    .where(eq(midiasCampanha.campanhaId, id));

  revalidatePath("/campanhas");
  revalidatePath(`/campanhas/${id}`);
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

export async function editarMidiaCampanha(
  id: string,
  formData: {
    fornecedorId?: string;
    pontoFisicoId?: string | null;
    categoriaMidia?: string;
    subtipoMidia?: string;
    formatoPeca?: string;
    biSemana?: string | null;
    dataInicio?: string;
    dataFim?: string;
    statusVeiculacao?: string;
    tipoAcaoFinal?: string | null;
    valorNegociado?: number | null;
    numPI?: string | null;
    observacoes?: string | null;
    fotoLocalUrl?: string | null;
  }
) {
  const midiaAtual = await db.query.midiasCampanha.findFirst({
    where: eq(midiasCampanha.id, id),
  });

  if (!midiaAtual) {
    throw new Error("Mídia não encontrada.");
  }

  // Se o ponto físico mudou
  const pontoMudou = formData.pontoFisicoId !== undefined && formData.pontoFisicoId !== midiaAtual.pontoFisicoId;

  if (pontoMudou && midiaAtual.pontoFisicoId) {
    // Verificar se outras mídias usam o ponto antigo
    const outras = await db
      .select({ id: midiasCampanha.id })
      .from(midiasCampanha)
      .where(
        and(
          eq(midiasCampanha.pontoFisicoId, midiaAtual.pontoFisicoId),
          ne(midiasCampanha.id, id)
        )
      );
    if (outras.length === 0) {
      await db
        .update(pontosFisicos)
        .set({ statusPonto: "Disponível / Mapeado" })
        .where(eq(pontosFisicos.id, midiaAtual.pontoFisicoId));
    }
  }

  const novoPontoId = formData.pontoFisicoId !== undefined ? formData.pontoFisicoId : midiaAtual.pontoFisicoId;

  if (pontoMudou && novoPontoId) {
    await db
      .update(pontosFisicos)
      .set({ statusPonto: "Comprado / Ativo" })
      .where(eq(pontosFisicos.id, novoPontoId));
  }

  // Se passou fotoLocalUrl e tem ponto físico vinculado, atualiza a foto do ponto
  if (formData.fotoLocalUrl !== undefined && novoPontoId) {
    await db
      .update(pontosFisicos)
      .set({ fotoLocalUrl: formData.fotoLocalUrl })
      .where(eq(pontosFisicos.id, novoPontoId));
  }

  await db
    .update(midiasCampanha)
    .set({
      fornecedorId: formData.fornecedorId ?? midiaAtual.fornecedorId,
      pontoFisicoId: novoPontoId || null,
      categoriaMidia: formData.categoriaMidia ?? midiaAtual.categoriaMidia,
      subtipoMidia: formData.subtipoMidia ?? midiaAtual.subtipoMidia,
      formatoPeca: formData.formatoPeca ?? midiaAtual.formatoPeca,
      tipoRegraPrazo: formData.biSemana ? "BISEMANA_FIXA" : (formData.dataInicio ? "MANUAL_DATAS" : midiaAtual.tipoRegraPrazo),
      biSemana: formData.biSemana !== undefined ? formData.biSemana : midiaAtual.biSemana,
      dataInicio: formData.dataInicio ?? midiaAtual.dataInicio,
      dataFim: formData.dataFim ?? midiaAtual.dataFim,
      statusVeiculacao: formData.statusVeiculacao ?? midiaAtual.statusVeiculacao,
      tipoAcaoFinal: formData.tipoAcaoFinal !== undefined ? formData.tipoAcaoFinal : midiaAtual.tipoAcaoFinal,
      valorNegociado: formData.valorNegociado !== undefined ? formData.valorNegociado : midiaAtual.valorNegociado,
      numPI: formData.numPI !== undefined ? formData.numPI : midiaAtual.numPI,
      observacoes: formData.observacoes !== undefined ? formData.observacoes : midiaAtual.observacoes,
    })
    .where(eq(midiasCampanha.id, id));

  revalidatePath("/campanhas");
  revalidatePath(`/campanhas/${midiaAtual.campanhaId}`);
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/");

  return { success: true };
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
  revalidatePath("/fornecedores");
  revalidatePath("/");

  return { success: true, id: pontoId };
}

export async function editarFornecedor(
  id: string,
  formData: {
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
  }
) {
  await db
    .update(fornecedores)
    .set({
      nome: formData.nome,
      categoriaGeral: formData.categoriaGeral || "OFFLINE",
      tipoVeiculo: formData.tipoVeiculo,
      praca: formData.praca || "Feira de Santana",
      contatoNome: formData.contatoNome || null,
      whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, "") : null,
      email: formData.email || null,
      prazoEntregaDias: formData.prazoEntregaDias || 2,
      specsTecnicas: formData.specsTecnicas || null,
      observacoes: formData.observacoes || null,
    })
    .where(eq(fornecedores.id, id));

  revalidatePath("/fornecedores");
  revalidatePath("/pontos");
  revalidatePath("/campanhas");
  revalidatePath("/");

  return { success: true };
}

export async function excluirFornecedor(id: string) {
  const pontos = await db
    .select({ id: pontosFisicos.id })
    .from(pontosFisicos)
    .where(eq(pontosFisicos.fornecedorId, id));

  for (const p of pontos) {
    await db.delete(checkings).where(eq(checkings.pontoFisicoId, p.id));
    await db.delete(midiasCampanha).where(eq(midiasCampanha.pontoFisicoId, p.id));
  }

  await db.delete(midiasCampanha).where(eq(midiasCampanha.fornecedorId, id));
  await db.delete(pontosFisicos).where(eq(pontosFisicos.fornecedorId, id));
  await db.delete(fornecedores).where(eq(fornecedores.id, id));

  revalidatePath("/fornecedores");
  revalidatePath("/pontos");
  revalidatePath("/campanhas");
  revalidatePath("/");

  return { success: true };
}

export async function editarPontoFisico(
  id: string,
  formData: {
    fornecedorId?: string;
    codigoIdentificador?: string;
    nomeLocal: string;
    tipoFormato: string;
    praca?: string;
    bairro: string;
    endereco?: string;
    latitude: number;
    longitude: number;
    fotoLocalUrl?: string | null;
    statusPonto?: string;
    observacoes?: string | null;
  }
) {
  await db
    .update(pontosFisicos)
    .set({
      ...(formData.fornecedorId ? { fornecedorId: formData.fornecedorId } : {}),
      codigoIdentificador: formData.codigoIdentificador || null,
      nomeLocal: formData.nomeLocal,
      tipoFormato: formData.tipoFormato,
      praca: formData.praca || "Feira de Santana",
      bairro: formData.bairro,
      endereco: formData.endereco || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      fotoLocalUrl: formData.fotoLocalUrl !== undefined ? formData.fotoLocalUrl : null,
      ...(formData.statusPonto ? { statusPonto: formData.statusPonto } : {}),
      observacoes: formData.observacoes !== undefined ? formData.observacoes : null,
    })
    .where(eq(pontosFisicos.id, id));

  revalidatePath("/fornecedores");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/campanhas");
  revalidatePath("/");

  return { success: true };
}

export async function excluirPontoFisico(id: string) {
  await db.delete(checkings).where(eq(checkings.pontoFisicoId, id));
  await db.delete(midiasCampanha).where(eq(midiasCampanha.pontoFisicoId, id));
  await db.delete(pontosFisicos).where(eq(pontosFisicos.id, id));

  revalidatePath("/fornecedores");
  revalidatePath("/pontos");
  revalidatePath("/mapa");
  revalidatePath("/campanhas");
  revalidatePath("/");

  return { success: true };
}
