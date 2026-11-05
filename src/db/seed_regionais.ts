import { db } from "./index";
import { fornecedores, pontosFisicos, midiasCampanha, campanhas } from "./schema";
import { eq } from "drizzle-orm";

export async function semearPontosRegionais() {
  console.log("🌱 Semeando praças regionais: Ipirá e Irecê...");

  // 1. FORNECEDORES DE IPIRÁ E IRECÊ
  const fornecedoresRegionais = [
    {
      id: "FORN-IPIRA-OOH",
      nome: "Ipirá Mídia & Outdoor",
      categoriaGeral: "OFFLINE" as const,
      tipoVeiculo: "Exibidora OOH",
      praca: "Ipirá",
      contatoNome: "Carlos Eduardo (Kadu)",
      whatsapp: "75991823344",
      email: "comercial@ipiramidia.com.br",
      prazoEntregaDias: 4,
      specsTecnicas: "Outdoor Lona 9,00 x 3,00m e Painel de LED Digital",
      observacoes: "Veículo parceiro regional com cobertura na BA-052 e centro de Ipirá.",
    },
    {
      id: "FORN-IPIRA-FM",
      nome: "Rádio Ipirá FM 104.1",
      categoriaGeral: "OFFLINE" as const,
      tipoVeiculo: "Rádio",
      praca: "Ipirá",
      contatoNome: "Diretoria Comercial",
      whatsapp: "75991441041",
      email: "comercial@ipirafm.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Spot 30s • Cobertura Bacia do Jacuípe",
      observacoes: "Líder de audiência em Ipirá e municípios vizinhos.",
    },
    {
      id: "FORN-IRECE-OOH",
      nome: "Sertão Mídia & Outdoor Irecê",
      categoriaGeral: "OFFLINE" as const,
      tipoVeiculo: "Exibidora OOH",
      praca: "Irecê",
      contatoNome: "Valmir Dourado",
      whatsapp: "74999815522",
      email: "comercial@sertaomidia.com.br",
      prazoEntregaDias: 4,
      specsTecnicas: "Outdoor Lona 9x3m, Mega Lona 10x3,5m e Frontlights",
      observacoes: "Exibidora líder em Irecê e Chapada Diamantina.",
    },
    {
      id: "FORN-IRECE-LED",
      nome: "Irecê Painéis LED & Publicidade",
      categoriaGeral: "OFFLINE" as const,
      tipoVeiculo: "Painel de LED / Mobiliário Urbano",
      praca: "Irecê",
      contatoNome: "Rodrigo Moitinho",
      whatsapp: "74999723311",
      email: "led@irecemidia.com.br",
      prazoEntregaDias: 1,
      specsTecnicas: "Painel de LED Full HD 7,00 x 3,50m",
      observacoes: "Circuito comercial de alto fluxo no Centro de Irecê.",
    },
    {
      id: "FORN-CARAIBAS-FM",
      nome: "Rádio Caraíbas FM 100.7 / Irecê Líder",
      categoriaGeral: "OFFLINE" as const,
      tipoVeiculo: "Rádio",
      praca: "Irecê",
      contatoNome: "Geraldo Oliveira",
      whatsapp: "74999611007",
      email: "comercial@caraibasfm.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Spot 30s e Testemunhais ao vivo",
      observacoes: "Alcance em mais de 20 cidades do Território de Irecê e Chapada.",
    },
  ];

  for (const f of fornecedoresRegionais) {
    await db.insert(fornecedores).values(f).onConflictDoUpdate({
      target: fornecedores.id,
      set: f,
    });
  }

  // 2. PONTOS FÍSICOS DE IPIRÁ E IRECÊ
  const pontosRegionais = [
    // --- IPIRÁ ---
    {
      id: "PONTO-IPIRA-BA052-ENTRADA",
      fornecedorId: "FORN-IPIRA-OOH",
      codigoIdentificador: "IPIRA-OOH-01",
      nomeLocal: "BA-052 Rodovia Estrada do Feijão (Trevo de Entrada de Ipirá)",
      tipoFormato: "Outdoor Lona 9,00 x 3,00m Iluminado",
      praca: "Ipirá",
      bairro: "Entrada da Cidade",
      endereco: "BA-052 km 84, Trevo de Acesso a Ipirá / Sentido Feira de Santana",
      latitude: -12.1520,
      longitude: -39.7280,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Pórtico de entrada de Ipirá. Alto impacto no fluxo de toda a Bacia do Jacuípe.",
    },
    {
      id: "PONTO-IPIRA-PRACA-ROBERTO-CINTRA",
      fornecedorId: "FORN-IPIRA-OOH",
      codigoIdentificador: "IPIRA-LED-01",
      nomeLocal: "Painel de LED Digital (Praça Roberto Cintra / Centro)",
      tipoFormato: "Painel de LED 6,00 x 3,00m",
      praca: "Ipirá",
      bairro: "Centro",
      endereco: "Praça Roberto Cintra, em frente à Igreja Matriz e polos bancários",
      latitude: -12.1585,
      longitude: -39.7385,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Coração comercial e de maior tráfego de pedestres de Ipirá.",
    },
    {
      id: "PONTO-IPIRA-ANISIO-DUTRA",
      fornecedorId: "FORN-IPIRA-OOH",
      codigoIdentificador: "IPIRA-OOH-02",
      nomeLocal: "Av. Anísio Dutra (Corredor Comercial / Próx. Posto Jacuípe)",
      tipoFormato: "Outdoor Lona 9,00 x 3,00m",
      praca: "Ipirá",
      bairro: "20 de Abril",
      endereco: "Av. Anísio Dutra, 410, próx. Posto Jacuípe",
      latitude: -12.1615,
      longitude: -39.7420,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Avenida arterial de Ipirá de grande fluxo comercial de calçados e vestuário.",
    },
    {
      id: "PONTO-IPIRA-POLO-UNIFAN",
      fornecedorId: "FORN-IPIRA-OOH",
      codigoIdentificador: "IPIRA-POLO-UNIFAN",
      nomeLocal: "UNIFAN Polo Ipirá (Fachada & Totem Institucional)",
      tipoFormato: "Totem Institucional & Painel Frontlight",
      praca: "Ipirá",
      bairro: "Centro",
      endereco: "Rua César Cabral, 120, Centro, Ipirá - BA",
      latitude: -12.1570,
      longitude: -39.7360,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Polo presencial UNIFAN Ipirá com estrutura de apoio e captação acadêmica.",
    },

    // --- IRECÊ ---
    {
      id: "PONTO-IRECE-BA052-TREVO",
      fornecedorId: "FORN-IRECE-OOH",
      codigoIdentificador: "IRECE-OOH-01",
      nomeLocal: "BA-052 Estrada do Feijão (Trevo de Entrada / Monumento de Irecê)",
      tipoFormato: "Outdoor Mega Lona (10,00 x 3,50m) Iluminado",
      praca: "Irecê",
      bairro: "Entrada da Cidade",
      endereco: "BA-052 entroncamento com Av. Raimundo Bonfim",
      latitude: -11.3120,
      longitude: -41.8480,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Principal pórtico visual na chegada a Irecê. Ponto de impacto em toda a macrorregião.",
    },
    {
      id: "PONTO-IRECE-SANTOS-LOPES",
      fornecedorId: "FORN-IRECE-OOH",
      codigoIdentificador: "IRECE-OOH-02",
      nomeLocal: "Av. Santos Lopes (Coração Financeiro & Calçadão Comercial)",
      tipoFormato: "Outdoor Lona 9,00 x 3,00m",
      praca: "Irecê",
      bairro: "Centro",
      endereco: "Av. Santos Lopes, 350, em frente aos bancos Caixa e Bradesco",
      latitude: -11.3045,
      longitude: -41.8570,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Área comercial nobre de Irecê com intenso tráfego de pedestres e empresários.",
    },
    {
      id: "PONTO-IRECE-LED-AYRTON-SENNA",
      fornecedorId: "FORN-IRECE-LED",
      codigoIdentificador: "IRECE-LED-01",
      nomeLocal: "Painel de LED Digital (Praça Ayrton Senna / Av. Adolfo Moitinho)",
      tipoFormato: "Painel de LED 6,00 x 3,00m",
      praca: "Irecê",
      bairro: "Centro",
      endereco: "Praça Ayrton Senna esquina com Av. Adolfo Moitinho",
      latitude: -11.3015,
      longitude: -41.8540,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Polo gastronômico e jovem de Irecê. 850 inserções diárias em alta definição.",
    },
    {
      id: "PONTO-IRECE-CORONEL-DOURADO",
      fornecedorId: "FORN-IRECE-OOH",
      codigoIdentificador: "IRECE-OOH-03",
      nomeLocal: "Av. Cel. Terêncio Dourado (Acesso ao Mercado Atacadista)",
      tipoFormato: "Outdoor Lona 9,00 x 3,00m",
      praca: "Irecê",
      bairro: "Paraíso",
      endereco: "Av. Cel. Terêncio Dourado, 820",
      latitude: -11.3070,
      longitude: -41.8610,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Ponto disponível para reserva no polo de comércio atacadista e serviços de Irecê.",
    },
  ];

  for (const p of pontosRegionais) {
    await db.insert(pontosFisicos).values(p).onConflictDoUpdate({
      target: pontosFisicos.id,
      set: p,
    });
  }

  // 3. VINCULAR VEICULAÇÕES DE CAMPANHA (UNIFAN & UNEF) NOS PONTOS ATIVOS
  const campanhasExistentes = await db.select().from(campanhas);
  const campUnifan = campanhasExistentes.find((c) => c.marcaId === "UNIFAN") || campanhasExistentes[0];
  const campUnef = campanhasExistentes.find((c) => c.marcaId === "UNEF") || campanhasExistentes[0];

  const midiasRegionais = [
    // Ipirá - Outdoor Trevo BA-052 (UNIFAN)
    {
      id: "MIDIA-IPIRA-01",
      campanhaId: campUnifan ? campUnifan.id : "CAMP-UNIFAN-POS-2026",
      marcaId: "UNIFAN",
      fornecedorId: "FORN-IPIRA-OOH",
      pontoFisicoId: "PONTO-IPIRA-BA052-ENTRADA",
      categoriaMidia: "OFFLINE",
      subtipoMidia: "OUTDOOR_BISEMANA",
      formatoPeca: "Outdoor Lona 9,00 x 3,00m Iluminado",
      tipoRegraPrazo: "BISEMANA_FIXA",
      biSemana: "BS 21 (06/10 a 19/10)",
      dataInicio: "2026-10-06",
      dataFim: "2026-10-19",
      statusVeiculacao: "No Ar / Ativo",
      tipoAcaoFinal: "Troca de Lona/Adesivo",
      valorNegociado: 1450.0,
      numPI: "PI-2026-IPIRA-01",
      observacoes: "Campanha Vestibular UNIFAN Polo Ipirá na rodovia BA-052.",
    },
    // Ipirá - LED Praça Roberto Cintra (UNIFAN)
    {
      id: "MIDIA-IPIRA-02",
      campanhaId: campUnifan ? campUnifan.id : "CAMP-UNIFAN-POS-2026",
      marcaId: "UNIFAN",
      fornecedorId: "FORN-IPIRA-OOH",
      pontoFisicoId: "PONTO-IPIRA-PRACA-ROBERTO-CINTRA",
      categoriaMidia: "OFFLINE",
      subtipoMidia: "LED_DIGITAL",
      formatoPeca: "Vídeo LED 15s (1080x540)",
      tipoRegraPrazo: "MANUAL_DATAS",
      biSemana: "Outubro 2026",
      dataInicio: "2026-10-01",
      dataFim: "2026-10-31",
      statusVeiculacao: "No Ar / Ativo",
      tipoAcaoFinal: "Renovação Contrato",
      valorNegociado: 1200.0,
      numPI: "PI-2026-IPIRA-LED",
      observacoes: "800 inserções diárias no centro comercial de Ipirá.",
    },
    // Irecê - Mega Outdoor Trevo BA-052 (UNEF Medicina)
    {
      id: "MIDIA-IRECE-01",
      campanhaId: campUnef ? campUnef.id : "CAMP-UNEF-MED-2026",
      marcaId: "UNEF",
      fornecedorId: "FORN-IRECE-OOH",
      pontoFisicoId: "PONTO-IRECE-BA052-TREVO",
      categoriaMidia: "OFFLINE",
      subtipoMidia: "OUTDOOR_BISEMANA",
      formatoPeca: "Outdoor Mega Lona (10,00 x 3,50m)",
      tipoRegraPrazo: "BISEMANA_FIXA",
      biSemana: "BS 21 (06/10 a 19/10)",
      dataInicio: "2026-10-06",
      dataFim: "2026-10-19",
      statusVeiculacao: "No Ar / Ativo",
      tipoAcaoFinal: "Troca de Lona/Adesivo",
      valorNegociado: 2100.0,
      numPI: "PI-2026-IRECE-01",
      observacoes: "Campanha Vestibular Medicina UNEF no pórtico de Irecê.",
    },
    // Irecê - Outdoor Av. Santos Lopes (UNIFAN)
    {
      id: "MIDIA-IRECE-02",
      campanhaId: campUnifan ? campUnifan.id : "CAMP-UNIFAN-POS-2026",
      marcaId: "UNIFAN",
      fornecedorId: "FORN-IRECE-OOH",
      pontoFisicoId: "PONTO-IRECE-SANTOS-LOPES",
      categoriaMidia: "OFFLINE",
      subtipoMidia: "OUTDOOR_BISEMANA",
      formatoPeca: "Outdoor Lona 9,00 x 3,00m",
      tipoRegraPrazo: "BISEMANA_FIXA",
      biSemana: "BS 21 (06/10 a 19/10)",
      dataInicio: "2026-10-06",
      dataFim: "2026-10-19",
      statusVeiculacao: "No Ar / Ativo",
      tipoAcaoFinal: "Troca de Lona/Adesivo",
      valorNegociado: 1600.0,
      numPI: "PI-2026-IRECE-02",
      observacoes: "Divulgação dos cursos da área de saúde e direito no centro financeiro.",
    },
    // Irecê - Painel de LED Praça Ayrton Senna (UNEF)
    {
      id: "MIDIA-IRECE-03",
      campanhaId: campUnef ? campUnef.id : "CAMP-UNEF-MED-2026",
      marcaId: "UNEF",
      fornecedorId: "FORN-IRECE-LED",
      pontoFisicoId: "PONTO-IRECE-LED-AYRTON-SENNA",
      categoriaMidia: "OFFLINE",
      subtipoMidia: "LED_DIGITAL",
      formatoPeca: "Vídeo LED 10s Full HD",
      tipoRegraPrazo: "MANUAL_DATAS",
      biSemana: "Outubro 2026",
      dataInicio: "2026-10-01",
      dataFim: "2026-10-31",
      statusVeiculacao: "No Ar / Ativo",
      tipoAcaoFinal: "Renovação Contrato",
      valorNegociado: 1500.0,
      numPI: "PI-2026-IRECE-LED",
      observacoes: "850 inserções diárias no polo gastronômico de Irecê.",
    },
  ];

  for (const m of midiasRegionais) {
    await db.insert(midiasCampanha).values(m).onConflictDoUpdate({
      target: midiasCampanha.id,
      set: m,
    });
  }

  console.log("✅ Praças de Ipirá e Irecê semeadas com sucesso!");
}
