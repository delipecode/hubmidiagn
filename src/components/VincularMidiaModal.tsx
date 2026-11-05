"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { adicionarMidiaCampanha } from "@/lib/actions";
import {
  Plus,
  X,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  Search,
  MonitorPlay,
  Dumbbell,
  Tv,
  Radio,
  Share2,
  FileText,
  MapPin,
  Check,
  Sparkles,
  Filter,
  DollarSign,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PontoFisicoItem {
  id: string;
  fornecedorId: string;
  codigoIdentificador?: string | null;
  nomeLocal: string;
  bairro: string;
  praca?: string;
  endereco?: string | null;
  tipoFormato: string;
  fotoLocalUrl?: string | null;
  statusPonto?: string;
  fornecedor?: {
    id: string;
    nome: string;
  } | null;
}

interface FornecedorItem {
  id: string;
  nome: string;
  tipoVeiculo: string;
  whatsapp?: string | null;
  email?: string | null;
}

interface VincularMidiaModalProps {
  campanhaId: string;
  marcaId: string;
  campanhaNome: string;
  pontosDisponiveis?: PontoFisicoItem[];
  fornecedores?: FornecedorItem[];
  onSucesso?: () => void;
}

// Categorias de Pontos Físicos
type CategoriaPonto =
  | "TODOS"
  | "OUTDOOR"
  | "OUTDOOR_DUPLO"
  | "PAINEL_LED"
  | "TV_INDOOR"
  | "ACADEMIA"
  | "PANFLETO";

function classificarPonto(tipoFormato: string): CategoriaPonto {
  const f = (tipoFormato || "").toLowerCase();
  if (
    f.includes("duplo") ||
    f.includes("triplo") ||
    f.includes("8 placas") ||
    f.includes("circuito de outdoors")
  ) {
    return "OUTDOOR_DUPLO";
  }
  if (f.includes("led") || f.includes("mobiliário urbano")) {
    return "PAINEL_LED";
  }
  if (
    f.includes("tela") ||
    f.includes("tv indoor") ||
    f.includes("digital indoor")
  ) {
    return "TV_INDOOR";
  }
  if (f.includes("academia") || f.includes("espelho") || f.includes("catraca")) {
    return "ACADEMIA";
  }
  if (
    f.includes("panfleto") ||
    f.includes("panfletagem") ||
    f.includes("folheto") ||
    f.includes("flyer")
  ) {
    return "PANFLETO";
  }
  return "OUTDOOR";
}

export function VincularMidiaModal({
  campanhaId,
  marcaId,
  campanhaNome,
  pontosDisponiveis = [],
  fornecedores = [],
  onSucesso,
}: VincularMidiaModalProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Tipo de canal macro: Ponto Físico ou Canal Direto
  const [tipoCanal, setTipoCanal] = useState<"PONTO_FISICO" | "CANAL_DIRETO">(
    "PONTO_FISICO"
  );

  // Filtros da catalogação de pontos físicos
  const [categoriaPontoSelecionada, setCategoriaPontoSelecionada] =
    useState<CategoriaPonto>("TODOS");
  const [pracaFiltro, setPracaFiltro] = useState<string>("TODAS");
  const [buscaPonto, setBuscaPonto] = useState<string>("");

  // Ponto Físico selecionado
  const [pontoFisicoId, setPontoFisicoId] = useState(
    pontosDisponiveis[0]?.id || ""
  );

  // Dados do formulário
  const [fornecedorId, setFornecedorId] = useState(
    fornecedores[0]?.id || "FORN-BULLOS"
  );
  const [subtipoMidia, setSubtipoMidia] = useState("OUTDOOR_BISEMANA");
  const [formatoPeca, setFormatoPeca] = useState("Lona 9,00 x 3,00m");
  const [biSemana, setBiSemana] = useState("BS 21 (06/10 a 19/10)");
  const [dataContrato, setDataContrato] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [tipoAcaoFinal, setTipoAcaoFinal] = useState("Troca de Lona/Adesivo");
  const [valorNegociado, setValorNegociado] = useState("");
  const [numPI, setNumPI] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Contagem de pontos por categoria
  const contagemCategorias = useMemo(() => {
    let outdoor = 0;
    let outdoorDuplo = 0;
    let painelLed = 0;
    let tvIndoor = 0;
    let academia = 0;
    let panfleto = 0;

    pontosDisponiveis.forEach((p) => {
      const cat = classificarPonto(p.tipoFormato);
      if (cat === "OUTDOOR") outdoor++;
      else if (cat === "OUTDOOR_DUPLO") outdoorDuplo++;
      else if (cat === "PAINEL_LED") painelLed++;
      else if (cat === "TV_INDOOR") tvIndoor++;
      else if (cat === "ACADEMIA") academia++;
      else if (cat === "PANFLETO") panfleto++;
    });

    return {
      outdoor,
      outdoorDuplo,
      painelLed,
      tvIndoor,
      academia,
      panfleto,
      todos: pontosDisponiveis.length,
    };
  }, [pontosDisponiveis]);

  // Filtragem dos pontos catalogados
  const pontosFiltrados = useMemo(() => {
    return pontosDisponiveis.filter((p) => {
      // Filtro de Categoria
      if (categoriaPontoSelecionada !== "TODOS") {
        const cat = classificarPonto(p.tipoFormato);
        if (cat !== categoriaPontoSelecionada) return false;
      }

      // Filtro de Praça
      if (pracaFiltro !== "TODAS") {
        if ((p.praca || "Feira de Santana") !== pracaFiltro) return false;
      }

      // Filtro de Busca
      if (buscaPonto.trim()) {
        const termo = buscaPonto.toLowerCase();
        const nome = (p.nomeLocal || "").toLowerCase();
        const bairro = (p.bairro || "").toLowerCase();
        const endereco = (p.endereco || "").toLowerCase();
        const codigo = (p.codigoIdentificador || "").toLowerCase();
        const formato = (p.tipoFormato || "").toLowerCase();
        const fornecedorNome = (
          p.fornecedor?.nome ||
          p.fornecedorId ||
          ""
        ).toLowerCase();

        return (
          nome.includes(termo) ||
          bairro.includes(termo) ||
          endereco.includes(termo) ||
          codigo.includes(termo) ||
          formato.includes(termo) ||
          fornecedorNome.includes(termo)
        );
      }

      return true;
    });
  }, [
    pontosDisponiveis,
    categoriaPontoSelecionada,
    pracaFiltro,
    buscaPonto,
  ]);

  // Ponto ativo selecionado
  const pontoAtivo = useMemo(() => {
    return pontosDisponiveis.find((p) => p.id === pontoFisicoId);
  }, [pontosDisponiveis, pontoFisicoId]);

  // Selecionar um ponto e sincronizar os campos automaticamente
  const selecionarPonto = (p: PontoFisicoItem) => {
    setPontoFisicoId(p.id);
    setFornecedorId(p.fornecedorId);
    setFormatoPeca(p.tipoFormato);

    const cat = classificarPonto(p.tipoFormato);
    if (cat === "OUTDOOR" || cat === "OUTDOOR_DUPLO") {
      setSubtipoMidia("OUTDOOR_BISEMANA");
      setTipoAcaoFinal("Troca de Lona/Adesivo");
    } else if (cat === "PAINEL_LED") {
      setSubtipoMidia("LED_DIGITAL");
      setTipoAcaoFinal("Renovação Contrato");
    } else if (cat === "TV_INDOOR") {
      setSubtipoMidia("INDOOR_TELAS");
      setTipoAcaoFinal("Renovação Contrato");
    } else if (cat === "ACADEMIA") {
      setSubtipoMidia("INDOOR_ACADEMIA");
      setTipoAcaoFinal("Troca de Lona/Adesivo");
    } else if (cat === "PANFLETO") {
      setSubtipoMidia("PANFLETO");
      setTipoAcaoFinal("Conclusão da Panfletagem");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      let finalFornecedorId = fornecedorId;
      let finalPontoId = pontoFisicoId;

      if (tipoCanal === "PONTO_FISICO") {
        if (!finalPontoId) {
          alert("Por favor, selecione um ponto catalogado.");
          setSalvando(false);
          return;
        }
        const ponto = pontosDisponiveis.find((p) => p.id === pontoFisicoId);
        if (ponto) {
          finalFornecedorId = ponto.fornecedorId;
        }
      } else {
        finalPontoId = "";
      }

      await adicionarMidiaCampanha({
        campanhaId,
        marcaId,
        fornecedorId: finalFornecedorId,
        pontoFisicoId: finalPontoId || null,
        categoriaMidia:
          subtipoMidia.startsWith("META") || subtipoMidia.startsWith("GOOGLE")
            ? "DIGITAL"
            : "OFFLINE",
        subtipoMidia,
        formatoPeca,
        biSemana:
          subtipoMidia === "OUTDOOR_BISEMANA" ? biSemana : undefined,
        dataContrato: dataContrato || undefined,
        dataInicio,
        dataFim,
        tipoAcaoFinal,
        valorNegociado: valorNegociado ? parseFloat(valorNegociado) : undefined,
        numPI: numPI || undefined,
        observacoes: observacoes || undefined,
      });

      setAberto(false);
      router.refresh();
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao vincular mídia:", err);
      alert("Erro ao vincular mídia à campanha.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Vincular Mídia / Ponto</span>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
            {/* TOPO */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
                    Vincular Mídia à Campanha
                  </h3>
                  <p className="text-xs text-slate-500">
                    Campanha:{" "}
                    <strong className="text-slate-900 font-bold">
                      {campanhaNome}
                    </strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* SELETOR MACRO: PONTO CATALOGADO vs CANAL DIRETO */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTipoCanal("PONTO_FISICO")}
                  className={cn(
                    "py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2",
                    tipoCanal === "PONTO_FISICO"
                      ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>📍 Pontos Catalogados (OOH / LED / Indoor)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipoCanal("CANAL_DIRETO");
                    setSubtipoMidia("PANFLETO");
                    setFormatoPeca("Panfleto 10x15cm (Couché 115g 4x4)");
                    setTipoAcaoFinal("Conclusão da Panfletagem");
                  }}
                  className={cn(
                    "py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2",
                    tipoCanal === "CANAL_DIRETO"
                      ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <FileText className="w-4 h-4 text-fuchsia-600" />
                  <span>📄 Panfleto, Rádio, TV ou Digital Direto</span>
                </button>
              </div>

              {/* MODO 1: PONTOS FÍSICOS CATALOGADOS POR CATEGORIA */}
              {tipoCanal === "PONTO_FISICO" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Filter className="w-4 h-4 text-blue-600" />
                        <span>Categorias de Mídia OOH / Indoor:</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Escolha a categoria para listar e selecionar os pontos
                        georreferenciados:
                      </p>
                    </div>

                    {/* SUB-FILTRO DE PRAÇAS */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0 text-[11px]">
                      <span className="text-slate-400 font-bold px-1.5">
                        Praça:
                      </span>
                      {["TODAS", "Feira de Santana", "Ipirá", "Irecê"].map(
                        (praca) => (
                          <button
                            key={praca}
                            type="button"
                            onClick={() => setPracaFiltro(praca)}
                            className={cn(
                              "px-2 py-1 rounded-lg font-bold transition-all",
                              pracaFiltro === praca
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            {praca === "TODAS"
                              ? "Todas"
                              : praca === "Feira de Santana"
                              ? "Feira"
                              : praca}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* CARDS / BOTÕES DE CATEGORIAS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {/* 1. TODOS */}
                    <button
                      type="button"
                      onClick={() => setCategoriaPontoSelecionada("TODOS")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all select-none",
                        categoriaPontoSelecionada === "TODOS"
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <div className="text-[10px] font-bold opacity-75 uppercase">
                        Todos
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {contagemCategorias.todos}
                      </div>
                    </button>

                    {/* 2. OUTDOOR */}
                    <button
                      type="button"
                      onClick={() => setCategoriaPontoSelecionada("OUTDOOR")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all select-none",
                        categoriaPontoSelecionada === "OUTDOOR"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                      )}
                    >
                      <div className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Outdoor
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {contagemCategorias.outdoor}
                      </div>
                    </button>

                    {/* 3. OUTDOOR DUPLO */}
                    <button
                      type="button"
                      onClick={() =>
                        setCategoriaPontoSelecionada("OUTDOOR_DUPLO")
                      }
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all select-none",
                        categoriaPontoSelecionada === "OUTDOOR_DUPLO"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      <div className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Duplo / Múltiplo
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {contagemCategorias.outdoorDuplo}
                      </div>
                    </button>

                    {/* 4. PAINEL DE LED */}
                    <button
                      type="button"
                      onClick={() => setCategoriaPontoSelecionada("PAINEL_LED")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all select-none",
                        categoriaPontoSelecionada === "PAINEL_LED"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
                      )}
                    >
                      <div className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                        <MonitorPlay className="w-3 h-3" /> Painel LED
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {contagemCategorias.painelLed}
                      </div>
                    </button>

                    {/* 5. TV INDOOR / TELAS */}
                    <button
                      type="button"
                      onClick={() => setCategoriaPontoSelecionada("TV_INDOOR")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all select-none",
                        categoriaPontoSelecionada === "TV_INDOOR"
                          ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-teal-300"
                      )}
                    >
                      <div className="text-[10px] font-bold text-teal-500 uppercase flex items-center gap-1">
                        <Tv className="w-3 h-3" /> TV Indoor
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {contagemCategorias.tvIndoor}
                      </div>
                    </button>

                    {/* 6. ACADEMIA / ADESIVOS */}
                    <button
                      type="button"
                      onClick={() => setCategoriaPontoSelecionada("ACADEMIA")}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all select-none",
                        categoriaPontoSelecionada === "ACADEMIA"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                      )}
                    >
                      <div className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" /> Academias
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {contagemCategorias.academia}
                      </div>
                    </button>
                  </div>

                  {/* CAMPO DE BUSCA RÁPIDA DE PONTOS */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={buscaPonto}
                      onChange={(e) => setBuscaPonto(e.target.value)}
                      placeholder="Buscar por avenida, bairro, código ou fornecedor (ex: Noide, Getúlio, Boulevard, Bullos, Tomba...)"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                    />
                    {buscaPonto && (
                      <button
                        type="button"
                        onClick={() => setBuscaPonto("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* LISTA / GRID DE PONTOS COM SELEÇÃO INTERATIVA */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                      <span>
                        Exibindo{" "}
                        <strong className="text-slate-900">
                          {pontosFiltrados.length}
                        </strong>{" "}
                        pontos disponíveis:
                      </span>
                      <span>Clique em um ponto para selecionar</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-2xl p-2 bg-white">
                      {pontosFiltrados.length > 0 ? (
                        pontosFiltrados.map((p) => {
                          const isSelected = p.id === pontoFisicoId;
                          const cat = classificarPonto(p.tipoFormato);
                          const fornNome =
                            p.fornecedor?.nome ||
                            fornecedores.find((f) => f.id === p.fornecedorId)
                              ?.nome ||
                            p.fornecedorId;

                          return (
                            <div
                              key={p.id}
                              onClick={() => selecionarPonto(p)}
                              className={cn(
                                "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                                isSelected
                                  ? "border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/50"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={cn(
                                    "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0",
                                    isSelected
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "border-slate-300 bg-slate-100 text-slate-400"
                                  )}
                                >
                                  {isSelected ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <MapPin className="w-3.5 h-3.5" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 text-xs truncate">
                                      {p.nomeLocal}
                                    </span>
                                    {p.codigoIdentificador && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                                        {p.codigoIdentificador}
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                                      {p.praca || "Feira de Santana"}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {p.bairro}
                                    {p.endereco ? ` • ${p.endereco}` : ""}
                                    <span className="text-slate-400">
                                      {" "}
                                      | Fornecedor:{" "}
                                    </span>
                                    <strong className="text-slate-700 font-semibold">
                                      {fornNome}
                                    </strong>
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                  {p.tipoFormato}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          Nenhum ponto encontrado com os filtros aplicados.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DESTAQUE DO PONTO ESCOLHIDO */}
                  {pontoAtivo && (
                    <div className="p-3.5 rounded-xl bg-blue-100/60 border border-blue-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                        <div>
                          <div className="text-[11px] text-blue-800 font-semibold">
                            Ponto Físico Selecionado:
                          </div>
                          <div className="font-bold text-slate-900 text-xs">
                            {pontoAtivo.nomeLocal}{" "}
                            <span className="font-normal text-slate-600">
                              ({pontoAtivo.bairro} •{" "}
                              {pontoAtivo.praca || "Feira de Santana"})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-blue-900">
                          {pontoAtivo.tipoFormato}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODO 2: CANAL DIRETO (PANFLETO, RÁDIO, TV, DIGITAL) */}
              {tipoCanal === "CANAL_DIRETO" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Tipo de Canal de Mídia:
                      </label>
                      <select
                        value={subtipoMidia}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubtipoMidia(val);
                          if (val === "PANFLETO") {
                            setFormatoPeca(
                              "Panfleto 10x15cm (Couché 115g 4x4)"
                            );
                            setTipoAcaoFinal("Conclusão da Panfletagem");
                          } else if (val === "RADIO") {
                            setFormatoPeca("Spot 30s (WAV)");
                            setTipoAcaoFinal("Renovação Contrato");
                          } else if (val === "TV") {
                            setFormatoPeca("VT Comercial 30s (Full HD)");
                            setTipoAcaoFinal("Renovação Contrato");
                          } else if (val === "META_ADS") {
                            setFormatoPeca(
                              "Feed (1080x1350) + Stories (1080x1920)"
                            );
                            setTipoAcaoFinal("Pausar Anúncios");
                          } else if (val === "GOOGLE_ADS") {
                            setFormatoPeca("Search + PMax + Vídeo YouTube");
                            setTipoAcaoFinal("Pausar Anúncios");
                          } else if (val === "PORTAL_NOTICIAS") {
                            setFormatoPeca("Super Banner 728x90 + Matéria");
                            setTipoAcaoFinal("Fim de Veiculação");
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="PANFLETO">
                          📄 Panfleto / Flyer Impresso (Panfletagem)
                        </option>
                        <option value="RADIO">
                          📻 Rádio FM (Spots / Testemunhais)
                        </option>
                        <option value="TV">
                          📺 Mídia de TV (VTs Comerciais)
                        </option>
                        <option value="META_ADS">
                          📱 Meta Ads (Feed, Stories & Reels)
                        </option>
                        <option value="GOOGLE_ADS">
                          🎯 Google Ads & YouTube
                        </option>
                        <option value="PORTAL_NOTICIAS">
                          🌐 Portal de Notícias
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Fornecedor / Gráfica / Veículo:
                      </label>
                      <select
                        value={fornecedorId}
                        onChange={(e) => setFornecedorId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                      >
                        {fornecedores.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nome} ({f.tipoVeiculo})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* DADOS DE EXECUÇÃO: ESPECIFICAÇÃO, BI-SEMANA E VIGÊNCIA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Formato / Especificação da Peça:
                  </label>
                  <input
                    type="text"
                    value={formatoPeca}
                    onChange={(e) => setFormatoPeca(e.target.value)}
                    placeholder="Ex: Lona 9,00 x 3,00m, Panfleto 10x15cm, Spot 30s"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Bi-Semana (se aplicável a Outdoor):
                  </label>
                  <input
                    type="text"
                    value={biSemana}
                    onChange={(e) => setBiSemana(e.target.value)}
                    placeholder="Ex: BS 21 (06/10 a 19/10)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* DATAS E PRAZOS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data
                    Início:
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data
                    Término:
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ação no Fim da Veiculação:
                  </label>
                  <select
                    value={tipoAcaoFinal}
                    onChange={(e) => setTipoAcaoFinal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Conclusão da Panfletagem">
                      Conclusão da Panfletagem
                    </option>
                    <option value="Reimpressão de Lote">
                      Reimpressão / Reposição de Lote
                    </option>
                    <option value="Troca de Lona/Adesivo">
                      Troca de Lona/Adesivo
                    </option>
                    <option value="Renovação Contrato">
                      Renovação de Contrato
                    </option>
                    <option value="Retirada Definitiva">
                      Retirada / Desmobilização
                    </option>
                    <option value="Pausar Anúncios">Pausar Anúncios</option>
                  </select>
                </div>
              </div>

              {/* DADOS CONTRATUAIS E FINANCEIROS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Data do Contrato / Fechamento:
                  </label>
                  <input
                    type="date"
                    value={dataContrato}
                    onChange={(e) => setDataContrato(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Data da assinatura/compra com veículo
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Número do PI / Contrato:
                  </label>
                  <input
                    type="text"
                    value={numPI}
                    onChange={(e) => setNumPI(e.target.value)}
                    placeholder="Ex: PI-2026/044"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Código do pedido de inserção
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Valor Negociado (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorNegociado}
                    onChange={(e) => setValorNegociado(e.target.value)}
                    placeholder="Ex: 1500.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Custo total bruto acordado
                  </span>
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Observações Técnicas / Logística:
                </label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Ponto frontal de alta retenção no cruzamento / Entrega do material na gráfica até sexta."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{salvando ? "Vinculando..." : "Vincular Mídia"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
