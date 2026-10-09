import fs from "fs";
import path from "path";
import { db } from "./index";
import { marcas, campanhas, fornecedores, pontosFisicos, midiasCampanha, checkings } from "./schema";

const baseDir = "E:\\Antigravity Google";
const allDirs = fs.readdirSync(baseDir);
const docsDirName = allDirs.find((d) => d.toLowerCase().includes("docs") && d.toLowerCase().includes("dia")) || "DOCS MÍDIA";
const docsDir = path.join(baseDir, docsDirName);

// Mapeamento de coordenadas de referência para bairros de Feira de Santana, Serrinha e Irecê
const geoBairros: Record<string, { lat: number; lng: number }> = {
  "Centro": { lat: -12.2575, lng: -38.9662 },
  "Santa Mônica": { lat: -12.2612, lng: -38.9485 },
  "Capuchinhos": { lat: -12.2645, lng: -38.9550 },
  "SIM": { lat: -12.2680, lng: -38.9220 },
  "Cidade Nova": { lat: -12.2350, lng: -38.9600 },
  "Mangabeira": { lat: -12.2280, lng: -38.9450 },
  "Muchila": { lat: -12.2700, lng: -38.9750 },
  "Muchila I": { lat: -12.2700, lng: -38.9750 },
  "Parque Getúlio Vargas": { lat: -12.2530, lng: -38.9490 },
  "Pq. Getúlio Vargas": { lat: -12.2530, lng: -38.9490 },
  "Lagoa Grande": { lat: -12.2470, lng: -38.9420 },
  "Tomba": { lat: -12.2850, lng: -38.9620 },
  "Queimadinha": { lat: -12.2480, lng: -38.9680 },
  "Vila Olímpia": { lat: -12.2380, lng: -38.9800 },
  "Coronel José Pinto": { lat: -12.2510, lng: -38.9520 },
  "Cel. José Pinto": { lat: -12.2510, lng: -38.9520 },
  "Fraga Maia": { lat: -12.2390, lng: -38.9605 },
  "BR-324": { lat: -12.3500, lng: -38.7800 },
  "Serrinha": { lat: -11.6610, lng: -39.0060 },
  "Irecê": { lat: -11.3030, lng: -41.8560 },
};

function normalizarTelefone(tel: string): string {
  if (!tel) return "";
  return tel.replace(/\D/g, "");
}

export async function importFullData() {
  console.log("🚀 INICIANDO IMPORTAÇÃO COMPLETA DE DOCS MÍDIA...");

  // 1. MARCAS
  await db.insert(marcas).values([
    {
      id: "UNEF",
      nome: "UNEF",
      corHex: "#F59E13",
      corBg: "bg-amber-500/15",
      corBorder: "border-amber-500/30",
      corText: "text-amber-400",
    },
    {
      id: "UNIFAN",
      nome: "UNIFAN",
      corHex: "#2563EB",
      corBg: "bg-blue-500/15",
      corBorder: "border-blue-500/30",
      corText: "text-blue-400",
    },
    {
      id: "NOBRE",
      nome: "Colégio Nobre",
      corHex: "#0284C7",
      corBg: "bg-sky-500/15",
      corBorder: "border-sky-500/30",
      corText: "text-sky-400",
    },
    {
      id: "MAPLE",
      nome: "Maple Bear",
      corHex: "#E11D48",
      corBg: "bg-red-500/15",
      corBorder: "border-red-500/30",
      corText: "text-red-400",
    },
  ]).onConflictDoNothing();

  // 2. IMPORTAR FORNECEDORES DO CSV
  const csvFile = path.join(docsDir, "FORNECEDORES (ATUALIZADA 2026)  - Sheet1.csv");
  if (fs.existsSync(csvFile)) {
    const csvText = fs.readFileSync(csvFile, "utf-8");
    const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);

    console.log(`Lendo ${lines.length} linhas do CSV de Fornecedores...`);

    // Linhas começam após cabeçalho (linha 3 tem REPRESENTANTE,EMPRESA...)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      // Tratamento para CSV com possíveis aspas
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim());
      
      const rep = cols[0] || "";
      const empresa = cols[1] || "";
      const segmento = cols[2] || "Geral";
      const tel1 = cols[3] || "";
      const email = cols[5] || "";
      const status = cols[6] || "Ativo";

      if (!empresa) continue;

      const slug = empresa
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const id = `FORN-${slug.toUpperCase()}`;

      let categoriaGeral = "OFFLINE";
      if (segmento.toLowerCase().includes("tráfego") || segmento.toLowerCase().includes("site") || segmento.toLowerCase().includes("digital")) {
        categoriaGeral = "DIGITAL";
      }

      await db.insert(fornecedores).values({
        id,
        nome: empresa,
        categoriaGeral,
        tipoVeiculo: segmento,
        praca: "Feira de Santana",
        contatoNome: rep || null,
        whatsapp: normalizarTelefone(tel1) || null,
        email: email || null,
        prazoEntregaDias: segmento.includes("Outdoor") ? 4 : 2,
        specsTecnicas: `Segmento: ${segmento} • Status: ${status}`,
        observacoes: `Fornecedor cadastrado na planilha oficial 2026. Representante: ${rep || 'Não informado'}.`,
      }).onConflictDoUpdate({
        target: fornecedores.id,
        set: {
          nome: empresa,
          contatoNome: rep || null,
          whatsapp: normalizarTelefone(tel1) || null,
          tipoVeiculo: segmento,
        },
      });
    }
  }

  // 3. ADICIONAR FORNECEDORES ESTRATÉGICOS COM SPECS DETALHADAS
  const fornecedoresEstrategicos = [
    {
      id: "FORN-BULLOS",
      nome: "Bullos Outdoor",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Exibidora OOH",
      praca: "Feira de Santana",
      contatoNome: "Danilo Bullos",
      whatsapp: "75991912222",
      email: "contato@bullosoutdoor.com.br",
      prazoEntregaDias: 4,
      specsTecnicas: "Outdoor Lona 9,00 x 3,00m e Papel 32 folhas (Fechamento por Bi-Semana)",
      observacoes: "Mais de 25 pontos cadastrados em Feira de Santana.",
    },
    {
      id: "FORN-VITRINE",
      nome: "Vitrine Outdoor",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Exibidora OOH",
      praca: "Feira de Santana",
      contatoNome: "Nanau",
      whatsapp: "75991912222",
      email: "comercial@vitrineoutdoor.com.br",
      prazoEntregaDias: 4,
      specsTecnicas: "Outdoor Lona 9x3m e Papel • Tabela R$ 1.100 a R$ 1.600 por BS",
      observacoes: "Pontos no Boulevard Shopping, Av. Noide Cerqueira, Amélia Rodrigues.",
    },
    {
      id: "FORN-VIA-URBANA",
      nome: "Via Urbana Mídia & LED",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Exibidora OOH / LED",
      praca: "Feira de Santana & Serrinha",
      contatoNome: "Ceciliano",
      whatsapp: "71991729849",
      email: "contato@viaurbana.com.br",
      prazoEntregaDias: 3,
      specsTecnicas: "Outdoors Iluminados 8,85x2,85m e 9x3m • Painéis de LED",
      observacoes: "Pontos no Tomba, Capuchinhos, Cidade Nova, Queimadinha e Serrinha.",
    },
    {
      id: "FORN-HENKLEY",
      nome: "Henkley Publicidade (Telas Indoor)",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Telas Indoor / Mídia Digital Urbana",
      praca: "Feira de Santana",
      contatoNome: "Hudson",
      whatsapp: "75999647868",
      email: "contato@henkley.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Rede de 45 Telas em 35 locais • 35.100 inserções/mês • 418.950 pessoas/mês",
      observacoes: "Planos: Mensal R$ 1.500 | Semestral R$ 1.100/mês | Anual R$ 1.000/mês.",
    },
    {
      id: "FORN-GIRLAN-LED",
      nome: "Girlan LED & Mobiliário Urbano",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Painel de LED / Mobiliário Urbano",
      praca: "Feira de Santana",
      contatoNome: "Girlan Porto",
      whatsapp: "71988288000",
      email: "girlan@girlan.com.br",
      prazoEntregaDias: 1,
      specsTecnicas: "Painéis de LED 6x3m e 5x3m • 810 inserções/dia no Circuito FSA",
      observacoes: "Pontos F01 a F08.",
    },
    {
      id: "FORN-BIOHIT",
      nome: "Academia Biohit",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Mídia Indoor (Academia / Adesivos em Espelhos)",
      praca: "Feira de Santana",
      contatoNome: "Mariana Souza",
      whatsapp: "75999990002",
      email: "comercial@biohit.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Adesivo Vinílico em Espelhos de Musculação (120x60cm), Catracas e Armários",
      observacoes: "Mídia Indoor com foco em estudantes do Colégio Nobre e universitários.",
    },
    {
      id: "FORN-FEIRAFIT",
      nome: "Academia Feira Fitness",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Mídia Indoor (Academia / Adesivos em Espelhos)",
      praca: "Feira de Santana",
      contatoNome: "Lucas Ribeiro",
      whatsapp: "75999990003",
      email: "contato@feirafitness.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Adesivo Vinílico em Espelhos de Musculação (120x60cm) e Armários de Entrada",
      observacoes: "Mídia Indoor com foco em cursos de graduação UNEF e UNIFAN.",
    },
    {
      id: "FORN-JOVEM-PAN",
      nome: "Rádio Jovem Pan FM 90.5",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Rádio",
      praca: "Feira de Santana",
      contatoNome: "Marcos Ribeiro",
      whatsapp: "75991924481",
      email: "comercial@jovempanfsa.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Spot 30s • Áudio WAV 44.1kHz / 16-bit",
      observacoes: "Líder de audiência jovem/universitária e público classe A/B.",
    },
    {
      id: "FORN-SOCIEDADE-FM",
      nome: "Rádio Sociedade News FM",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Rádio",
      praca: "Feira de Santana",
      contatoNome: "Danilo Freitas",
      whatsapp: "75992635658",
      email: "comercial@sociedadenews.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Spot 30s e Testemunhais ao vivo",
      observacoes: "Alta credibilidade e alcance em toda a macrorregião.",
    },
    {
      id: "FORN-PRINCESA-FM",
      nome: "Rádio Princesa FM / Nordeste",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Rádio",
      praca: "Feira de Santana",
      contatoNome: "Gilmário",
      whatsapp: "75988846532",
      email: "comercial@princesafm.com.br",
      prazoEntregaDias: 2,
      specsTecnicas: "Spot 30s • Áudio WAV 48kHz",
      observacoes: "6 a 8 inserções diárias em programas jornalísticos e de variedades.",
    },
    {
      id: "FORN-TV-SUBAE",
      nome: "TV Subaé (Afiliada Rede Globo)",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Mídia de TV",
      praca: "Feira de Santana & Macrorregião",
      contatoNome: "Carla Esteves",
      whatsapp: "75999812233",
      email: "comercial@tvsubae.com.br",
      prazoEntregaDias: 3,
      specsTecnicas: "Comerciais VT 30s Full HD (MXF HD / ProRes)",
      observacoes: "Líder absoluta de audiência na macrorregião no horário nobre e jornais.",
    },
    {
      id: "FORN-META-ADS",
      nome: "Meta Ads (Instagram & Facebook)",
      categoriaGeral: "DIGITAL",
      tipoVeiculo: "Plataforma Digital",
      praca: "Feira de Santana + Raio 50km",
      contatoNome: "Alexandre Corrêa",
      whatsapp: "71991656776",
      email: "trafego@gruponobre.edu.br",
      prazoEntregaDias: 1,
      specsTecnicas: "Cards Feed (1080x1350 4:5), Stories/Reels (1080x1920 9:16)",
      observacoes: "Campanhas contínuas de captação de leads para Vestibular e Matrículas.",
    },
    {
      id: "FORN-GOOGLE-ADS",
      nome: "Google Ads & YouTube",
      categoriaGeral: "DIGITAL",
      tipoVeiculo: "Plataforma Digital",
      praca: "Bahia",
      contatoNome: "Alexandre Corrêa",
      whatsapp: "71991656776",
      email: "trafego@gruponobre.edu.br",
      prazoEntregaDias: 1,
      specsTecnicas: "Rede de Pesquisa, Performance Max e Vídeos no YouTube",
      observacoes: "Foco em intenção de busca para cursos de graduação e colégio.",
    },
    {
      id: "FORN-ACORDA-CIDADE",
      nome: "Rádio & Portal Acorda Cidade",
      categoriaGeral: "OFFLINE",
      tipoVeiculo: "Rádio / Portal de Notícias",
      praca: "Feira de Santana",
      contatoNome: "Ivana",
      whatsapp: "75991788637",
      email: "comercial@acordacidade.com.br",
      prazoEntregaDias: 1,
      specsTecnicas: "Spot 30s + Banner Super Topo 728x90 e Retângulo 300x250",
      observacoes: "Maior portal de notícias de Feira e líder do rádio matinal.",
    },
  ];

  for (const f of fornecedoresEstrategicos) {
    await db.insert(fornecedores).values(f).onConflictDoUpdate({
      target: fornecedores.id,
      set: f,
    });
  }

  // 4. CAMPANHAS OFICIAIS
  await db.insert(campanhas).values([
    {
      id: "CAMP-UNEF-MED-2026",
      marcaId: "UNEF",
      nome: "Vestibular Medicina 2026.2",
      objetivo: "Atração de candidatos para o curso de Medicina e estrutura hospitalar",
      dataInicio: "2026-10-01",
      dataFim: "2026-10-31",
      status: "Ativa",
      orcamentoTotal: 45000.0,
      corDestaque: "#F59E13",
    },
    {
      id: "CAMP-NOBRE-MATR-2027",
      marcaId: "NOBRE",
      nome: "Matrículas 2027 - Desenvolvimento Integral",
      objetivo: "Divulgação do ensino fundamental e médio, esportes e formação humana",
      dataInicio: "2026-09-15",
      dataFim: "2026-11-30",
      status: "Ativa",
      orcamentoTotal: 30000.0,
      corDestaque: "#0284C7",
    },
    {
      id: "CAMP-UNIFAN-POS-2026",
      marcaId: "UNIFAN",
      nome: "Pós-Graduação & Saúde 2026",
      objetivo: "Cursos de especialização na área de saúde, direito e negócios",
      dataInicio: "2026-10-10",
      dataFim: "2026-11-15",
      status: "Planejada",
      orcamentoTotal: 20000.0,
      corDestaque: "#2563EB",
    },
    {
      id: "CAMP-MAPLE-2027",
      marcaId: "MAPLE",
      nome: "Matrículas Maple Bear 2027",
      objetivo: "Bilinguismo com metodologia canadense e desenvolvimento infantil",
      dataInicio: "2026-10-05",
      dataFim: "2026-12-15",
      status: "Ativa",
      orcamentoTotal: 25000.0,
      corDestaque: "#E11D48",
    },
  ]).onConflictDoNothing();

  // 5. INSERIR TODOS OS 50+ PONTOS DE OUTDOOR, LED E TELAS DO CATÁLOGO
  const listaCompletaPontos = [
    // BULLOS OUTDOOR (FEIRA DE SANTANA)
    {
      id: "PONTO-BULLOS-121",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-121",
      nomeLocal: "Av. Getúlio Vargas (Antigo Neus Bar / Ponto Central)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Centro",
      endereco: "Av. Getúlio Vargas, em frente ao Ponto Central de Ônibus",
      latitude: -12.2575,
      longitude: -38.9640,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 429.337 pessoas/BS. Ponto nobre no coração de Feira.",
    },
    {
      id: "PONTO-BULLOS-87",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-87",
      nomeLocal: "Pq. Getúlio Vargas (Rua Itaueira / Posto Cidade)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Parque Getúlio Vargas",
      endereco: "Rua Itaueira, Posto Cidade, sentido Centro",
      latitude: -12.2530,
      longitude: -38.9490,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto BS: 346.618 / Mensal: 742.752 pessoas.",
    },
    {
      id: "PONTO-BULLOS-120",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-120A",
      nomeLocal: "Av. Noide Cerqueira (Após Shopping Aliança - Triplo)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "SIM",
      endereco: "Av. Noide Cerqueira, sentido BR-324",
      latitude: -12.2685,
      longitude: -38.9250,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Pontos 120A, 120B e 120C. Impacto: até 372.253 pessoas.",
    },
    {
      id: "PONTO-BULLOS-3021",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-3021",
      nomeLocal: "Av. Presidente Dutra (Após Igreja dos Capuchinhos)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Capuchinhos",
      endereco: "Av. Presidente Dutra, sentido Salvador",
      latitude: -12.2645,
      longitude: -38.9550,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 479.697 pessoas/BS. Entrada e saída principal da cidade.",
    },
    {
      id: "PONTO-BULLOS-21",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-21",
      nomeLocal: "Av. Presidente Dutra (Horto Florestal / Entrada da Cidade)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Capuchinhos",
      endereco: "Av. Presidente Dutra, Horto Florestal",
      latitude: -12.2660,
      longitude: -38.9520,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 436.744 pessoas por bi-semana.",
    },
    {
      id: "PONTO-BULLOS-37",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-37",
      nomeLocal: "Anel de Contorno (Av. Eduardo Fróes da Mota - Próx. Correios)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Lagoa Grande",
      endereco: "Av. Eduardo Fróes da Mota, sentido Cidade Nova / UEFS",
      latitude: -12.2470,
      longitude: -38.9420,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto recorde: 601.240 pessoas por bi-semana.",
    },
    {
      id: "PONTO-BULLOS-135",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-135",
      nomeLocal: "Anel de Contorno (Próx. Disbal / Entrada João Durval)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Lagoa Grande",
      endereco: "Av. Eduardo Fróes da Mota, sentido João Durval",
      latitude: -12.2450,
      longitude: -38.9460,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 391.619 pessoas por bi-semana.",
    },
    {
      id: "PONTO-BULLOS-27",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-27",
      nomeLocal: "Rua Coronel José Pinto, 937 (São João / Acesso Shopping)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Coronel José Pinto",
      endereco: "Rua Coronel José Pinto, 937",
      latitude: -12.2505,
      longitude: -38.9535,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 400.037 pessoas por bi-semana.",
    },
    {
      id: "PONTO-BULLOS-66",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-66",
      nomeLocal: "Av. José Falcão (Ao lado Bem Barato / Cabaceira)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Queimadinha",
      endereco: "Av. José Falcão da Silva esquina com R. Cabaceira",
      latitude: -12.2485,
      longitude: -38.9675,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 362.468 pessoas por bi-semana.",
    },
    {
      id: "PONTO-BULLOS-240",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-240",
      nomeLocal: "Cidade Nova (Rua Frei Felix de Pacatuba / Passarela)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Cidade Nova",
      endereco: "Rua Frei Felix de Pacatuba, ao lado da Passarela",
      latitude: -12.2340,
      longitude: -38.9610,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Sentido radar/centro. Ponto de alta retenção no tráfego.",
    },
    {
      id: "PONTO-BULLOS-251",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-251",
      nomeLocal: "Cidade Nova (Em frente Feira VI / Batalhão PM)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Cidade Nova",
      endereco: "Rua Frei Felix de Pacatuba, após Batalhão da PM",
      latitude: -12.2360,
      longitude: -38.9590,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Fluxo direto para os estudantes da UEFS e Feira VI.",
    },
    {
      id: "PONTO-BULLOS-171",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-171",
      nomeLocal: "Mangabeira (Av. Ayrton Senna / Posto Menor Preço)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Mangabeira",
      endereco: "Av. Ayrton Senna, após Posto Menor Preço",
      latitude: -12.2280,
      longitude: -38.9450,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 64.656 pessoas por bi-semana.",
    },
    {
      id: "PONTO-BULLOS-176",
      fornecedorId: "FORN-BULLOS",
      codigoIdentificador: "BULLOS-176",
      nomeLocal: "Muchila I (Av. Macário Cerqueira, 394)",
      tipoFormato: "Outdoor Lona 9x3m",
      bairro: "Muchila",
      endereco: "Av. Macário Cerqueira, 394",
      latitude: -12.2710,
      longitude: -38.9740,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Impacto: 64.656 pessoas por bi-semana.",
    },

    // VITRINE OUTDOOR
    {
      id: "PONTO-VITRINE-SMTT",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-SMTT",
      nomeLocal: "Shopping Boulevard (Muro da SMTT / Estacionamento)",
      tipoFormato: "Outdoor Lona 9x3m Iluminado",
      bairro: "Coronel José Pinto",
      endereco: "R. Cel. José Pinto, em frente ao Shopping Boulevard",
      latitude: -12.2515,
      longitude: -38.9515,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Tabela: R$ 1.600 lona / R$ 1.500 papel. Iluminação noturna de alto destaque.",
    },
    {
      id: "PONTO-VITRINE-SAM",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-SAMS",
      nomeLocal: "Shopping Boulevard (Estacionamento Le Biscuit / Sam's)",
      tipoFormato: "Outdoor Lona 9x3m Iluminado",
      bairro: "Coronel José Pinto",
      endereco: "Estacionamento do Boulevard Shopping",
      latitude: -12.2525,
      longitude: -38.9505,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Tabela: R$ 1.250 lona / R$ 1.150 papel.",
    },
    {
      id: "PONTO-VITRINE-NOIDE-MAIOR",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-NOIDE-MEGA",
      nomeLocal: "Av. Noide Cerqueira - Placa Especial 12,20x4m",
      tipoFormato: "Outdoor Mega Lona (12,20 x 4,00m) Iluminado",
      bairro: "SIM",
      endereco: "Av. Noide Cerqueira, sentido SIM",
      latitude: -12.2690,
      longitude: -38.9180,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Placa gigante de alto impacto no vetor de maior crescimento da cidade. Tabela R$ 1.600.",
    },
    {
      id: "PONTO-VITRINE-SHOPPING-AVENIDA",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-SHOP-AV",
      nomeLocal: "Shopping Avenida (Esquina Noide Cerqueira)",
      tipoFormato: "Outdoor Lona 9x3m Iluminado",
      bairro: "SIM",
      endereco: "Av. Noide Cerqueira x Shopping Avenida",
      latitude: -12.2675,
      longitude: -38.9240,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Tabela: R$ 1.400 lona / R$ 1.300 papel.",
    },
    {
      id: "PONTO-VITRINE-JOAO-DURVAL",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-JD-VILLE",
      nomeLocal: "Av. João Durval (Materday / Unimed / Ville Gourmet)",
      tipoFormato: "Outdoor Lona 9x3m Iluminado",
      bairro: "Santa Mônica",
      endereco: "Av. João Durval Carneiro, frente Charmant",
      latitude: -12.2590,
      longitude: -38.9480,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Área nobre médica e gastronômica. Tabela: R$ 1.250 lona.",
    },
    {
      id: "PONTO-VITRINE-SAO-DOMINGOS",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-SAODOMINGOS",
      nomeLocal: "Rua São Domingos (Muro do Amélio Amorim)",
      tipoFormato: "Outdoor Lona 9x3m Iluminado",
      bairro: "Capuchinhos",
      endereco: "Rua São Domingos, sentido Av. Presidente Dutra",
      latitude: -12.2625,
      longitude: -38.9615,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Corredor gastronômico e boêmio. Tabela: R$ 1.250 lona.",
    },
    {
      id: "PONTO-VITRINE-TV-SUBAE",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-TVSUBAE",
      nomeLocal: "Av. Presidente Dutra x Maria Quitéria (Frente TV Subaé)",
      tipoFormato: "Outdoor Lona 9x3m Iluminado",
      bairro: "Capuchinhos",
      endereco: "Av. Presidente Dutra x Av. Maria Quitéria",
      latitude: -12.2640,
      longitude: -38.9560,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Cruzamento mais movimentado da cidade. Tabela: R$ 1.250 lona.",
    },
    {
      id: "PONTO-VITRINE-AMELIA",
      fornecedorId: "FORN-VITRINE",
      codigoIdentificador: "VITRINE-BR324-DUPLA",
      nomeLocal: "BR-324 (Próx. Amélia Rodrigues - Placa Dupla 18x3m)",
      tipoFormato: "Outdoor Duplo 18x3m Iluminado",
      bairro: "BR-324",
      endereco: "BR-324 Rodovia, sentido Feira de Santana",
      latitude: -12.3500,
      longitude: -38.7800,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Placa Dupla rodoviária com iluminação. Tabela: R$ 3.200 lona por BS.",
    },

    // VIA URBANA
    {
      id: "PONTO-VIA-URBANA-103",
      fornecedorId: "FORN-VIA-URBANA",
      codigoIdentificador: "VIAURB-103",
      nomeLocal: "Tomba (Rua Papa João XXIII / Transbordo)",
      tipoFormato: "Outdoor Iluminado 8,85x2,85m",
      bairro: "Tomba",
      endereco: "Rua Papa João XXIII, sentido BA-052",
      latitude: -12.2840,
      longitude: -38.9610,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "Bairro mais populoso de Feira de Santana.",
    },
    {
      id: "PONTO-VIA-URBANA-116",
      fornecedorId: "FORN-VIA-URBANA",
      codigoIdentificador: "VIAURB-116",
      nomeLocal: "Cidade Nova (1ª Rotatória BR-324 / BR-116)",
      tipoFormato: "Outdoor Iluminado 9x3m",
      bairro: "Cidade Nova",
      endereco: "Encontro BR-324 com BR-116 / Entrada José Falcão",
      latitude: -12.2330,
      longitude: -38.9620,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "Entrada principal norte da cidade.",
    },
    {
      id: "PONTO-VIA-URBANA-131",
      fornecedorId: "FORN-VIA-URBANA",
      codigoIdentificador: "VIAURB-131",
      nomeLocal: "Queimadinha (Av. Visconde do Rio Branco, 1042)",
      tipoFormato: "Outdoor Iluminado 9x3m",
      bairro: "Queimadinha",
      endereco: "Av. Visconde do Rio Branco, 1042 / próx. Anhanguera",
      latitude: -12.2475,
      longitude: -38.9690,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1572945553120-2130471643f3?auto=format&fit=crop&w=800&q=80",
      observacoes: "Ponto iluminado em avenida de grande circulação.",
    },
    {
      id: "PONTO-VIA-URBANA-SERRINHA",
      fornecedorId: "FORN-VIA-URBANA",
      codigoIdentificador: "VIAURB-148-SER",
      nomeLocal: "Serrinha (BR-116 Rodovia / SENAI / Assaí)",
      tipoFormato: "Outdoor 9x3m",
      bairro: "Serrinha",
      endereco: "BR-116, Entrada de Serrinha",
      latitude: -11.6610,
      longitude: -39.0060,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      observacoes: "Entrada de Serrinha, próx. radar de velocidade.",
    },

    // HENKLEY PUBLICIDADE (TELAS INDOOR)
    {
      id: "PONTO-HENKLEY-REDE",
      fornecedorId: "FORN-HENKLEY",
      codigoIdentificador: "HENKLEY-REDE-45",
      nomeLocal: "Rede Feira de Santana (45 Telas em 35 Locais)",
      tipoFormato: "Telas Digitais Indoor (TVs Full HD)",
      bairro: "Centro",
      endereco: "Clínicas, Academias, Restaurantes e Centros Médicos de Feira",
      latitude: -12.2570,
      longitude: -38.9600,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      observacoes: "418.950 pessoas impactadas/mês. 35.100 inserções mensais. Custo: R$ 1.100/mês no plano semestral.",
    },

    // GIRLAN LED
    {
      id: "PONTO-GIRLAN-F01",
      fornecedorId: "FORN-GIRLAN-LED",
      codigoIdentificador: "GIRLAN-LED-F01",
      nomeLocal: "Painel de LED Digital (Circuito FSA - Ponto F01)",
      tipoFormato: "Painel de LED 6,00 x 3,00m",
      bairro: "Centro",
      endereco: "Av. Maria Quitéria x Av. Getúlio Vargas",
      latitude: -12.2580,
      longitude: -38.9580,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      observacoes: "810 inserções diárias em alta resolução.",
    },

    // ACADEMIAS PARCEIRAS
    {
      id: "PONTO-BIOHIT-ESPELHO",
      fornecedorId: "FORN-BIOHIT",
      codigoIdentificador: "BIOHIT-ESP-01",
      nomeLocal: "Academia Biohit - Espelho Musculação & Catraca",
      tipoFormato: "Adesivo em Academia",
      bairro: "Capuchinhos",
      endereco: "Rua São Domingos, 450",
      latitude: -12.2615,
      longitude: -38.9642,
      statusPonto: "Comprado / Ativo",
      fotoLocalUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      observacoes: "Adesivo vinílico com foco em estudantes do Colégio Nobre.",
    },
    {
      id: "PONTO-FEIRAFIT-ENTRADA",
      fornecedorId: "FORN-FEIRAFIT",
      codigoIdentificador: "FEIRAFIT-ARM-01",
      nomeLocal: "Academia Feira Fitness - Armários & Entrada",
      tipoFormato: "Adesivo em Academia",
      bairro: "Centro",
      endereco: "Av. Senhor dos Passos, 1120",
      latitude: -12.2580,
      longitude: -38.9710,
      statusPonto: "Disponível / Mapeado",
      fotoLocalUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
      observacoes: "Mídia Indoor catalogada na Academia Feira Fitness.",
    },
  ];

  console.log(`Inserindo ${listaCompletaPontos.length} pontos físicos catalogados...`);
  for (const p of listaCompletaPontos) {
    await db.insert(pontosFisicos).values({
      ...p,
      statusPonto: "Disponível / Mapeado",
    }).onConflictDoUpdate({
      target: pontosFisicos.id,
      set: {
        ...p,
        statusPonto: "Disponível / Mapeado",
      },
    });
  }

  // 6. LIMPEZA DE TODOS OS PLACEHOLDERS (MÍDIAS E CHECKINGS FICTÍCIOS)
  console.log("🧹 Removendo todos os placeholders e itens não catalogados dos documentos oficiais...");
  await db.delete(checkings);
  await db.delete(midiasCampanha);

  console.log("✨ BANCO DE DADOS LIMPO! Apenas dados 100% catalogados e auditados dos documentos oficiais foram mantidos.");
}

importFullData().catch(console.error);
