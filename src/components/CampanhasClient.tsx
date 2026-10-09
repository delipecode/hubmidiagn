"use client";

import { useState, useMemo } from "react";
import { BrandBadge, StatusBadge, MediaCategoryBadge, CountdownBadge } from "@/components/BrandBadge";
import { EditarCampanhaModal } from "@/components/EditarCampanhaModal";
import { ExcluirCampanhaModal } from "@/components/ExcluirCampanhaModal";
import { VincularMidiaModal } from "@/components/VincularMidiaModal";
import { excluirMidiaCampanha } from "@/lib/actions";
import { formatarData } from "@/lib/utils";
import Link from "next/link";
import {
  Layers,
  MapPin,
  Building2,
  Tv,
  Radio,
  Share2,
  Phone,
  Calendar,
  Sparkles,
  Search,
  Dumbbell,
  MonitorPlay,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Trash2,
} from "lucide-react";

interface PontoFisico {
  id: string;
  fornecedorId: string;
  nomeLocal: string;
  bairro: string;
  endereco: string | null;
  tipoFormato: string;
  fotoLocalUrl: string | null;
}

interface Fornecedor {
  id: string;
  nome: string;
  tipoVeiculo: string;
  whatsapp: string | null;
  email: string | null;
}

interface MidiaCampanha {
  id: string;
  campanhaId: string;
  marcaId: string;
  categoriaMidia: string;
  subtipoMidia: string;
  formatoPeca: string;
  tipoRegraPrazo: string;
  biSemana: string | null;
  dataInicio: string;
  dataFim: string;
  statusVeiculacao: string;
  tipoAcaoFinal: string | null;
  numPI: string | null;
  valorNegociado: number | null;
  observacoes: string | null;
  pontoFisico?: PontoFisico | null;
  fornecedor: Fornecedor;
}

interface Campanha {
  id: string;
  marcaId: string;
  nome: string;
  objetivo: string | null;
  dataInicio: string;
  dataFim: string;
  status: string;
  orcamentoTotal: number | null;
  corDestaque: string | null;
  marca: {
    id: string;
    nome: string;
    corHex: string;
  };
  midias: MidiaCampanha[];
}

export function CampanhasClient({
  campanhas,
  pontosDisponiveis = [],
  fornecedores = [],
}: {
  campanhas: Campanha[];
  pontosDisponiveis?: PontoFisico[];
  fornecedores?: Fornecedor[];
}) {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>("TODAS");
  const [tipoMidiaFiltro, setTipoMidiaFiltro] = useState<string>("TODOS");
  const [apenasAtivos, setApenasAtivos] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>("");
  const [excluindoMidiaId, setExcluindoMidiaId] = useState<string | null>(null);

  // Marcas e seus contadores
  const empresasList = [
    { id: "TODAS", label: "Todas as Empresas", count: campanhas.length },
    { id: "MAPLE", label: "Maple Bear", count: campanhas.filter((c) => c.marcaId === "MAPLE").length },
    { id: "UNEF", label: "UNEF", count: campanhas.filter((c) => c.marcaId === "UNEF").length },
    { id: "UNIFAN", label: "UNIFAN", count: campanhas.filter((c) => c.marcaId === "UNIFAN").length },
    { id: "NOBRE", label: "Colégio Nobre", count: campanhas.filter((c) => c.marcaId === "NOBRE").length },
  ];

  // Tipos de mídia para o menu seletor
  const tiposMidiaOptions = [
    { id: "TODOS", label: "Todas as Mídias", icon: Layers },
    { id: "OUTDOOR", label: "Outdoors", icon: Building2 },
    { id: "INDOOR_TELAS", label: "TV Indoor / Telas", icon: MonitorPlay },
    { id: "LED", label: "Painéis de LED", icon: MonitorPlay },
    { id: "ACADEMIA", label: "Adesivos / Academias", icon: Dumbbell },
    { id: "RADIO", label: "Rádio (Spots)", icon: Radio },
    { id: "TV", label: "Mídia de TV (VTs)", icon: Tv },
    { id: "DIGITAL", label: "Digital (Meta / Google)", icon: Share2 },
  ];

  // Helper para verificar se a mídia bate com o filtro de tipo
  const matchesTipoMidia = (m: MidiaCampanha, tipo: string) => {
    if (tipo === "TODOS") return true;
    if (tipo === "OUTDOOR") return m.subtipoMidia === "OUTDOOR_BISEMANA" || m.subtipoMidia === "BUSDOOR";
    if (tipo === "INDOOR_TELAS") return m.subtipoMidia === "INDOOR_TELAS";
    if (tipo === "LED") return m.subtipoMidia === "LED_DIGITAL";
    if (tipo === "ACADEMIA") return m.subtipoMidia === "INDOOR_ACADEMIA";
    if (tipo === "RADIO") return m.subtipoMidia === "RADIO";
    if (tipo === "TV") return m.subtipoMidia === "TV";
    if (tipo === "DIGITAL") return m.categoriaMidia === "DIGITAL" || m.subtipoMidia === "PORTAL_NOTICIAS";
    return true;
  };

  // Filtragem da hierarquia EMPRESA > CAMPANHA > CANAIS/MÍDIAS
  const campanhasComMidiasFiltradas = useMemo(() => {
    return campanhas
      .filter((campanha) => {
        // Filtro por Empresa
        if (empresaSelecionada !== "TODAS" && campanha.marcaId !== empresaSelecionada) {
          return false;
        }
        return true;
      })
      .map((campanha) => {
        // Filtrar as mídias da campanha de acordo com filtros ativos
        const midiasFiltradas = (campanha.midias || []).filter((m) => {
          // Filtro apenas ATIVOS
          if (apenasAtivos && m.statusVeiculacao !== "No Ar / Ativo") {
            return false;
          }

          // Filtro por Tipo de Mídia
          if (!matchesTipoMidia(m, tipoMidiaFiltro)) {
            return false;
          }

          // Filtro de Busca
          if (busca) {
            const term = busca.toLowerCase();
            const match =
              m.formatoPeca.toLowerCase().includes(term) ||
              m.fornecedor.nome.toLowerCase().includes(term) ||
              (m.biSemana && m.biSemana.toLowerCase().includes(term)) ||
              (m.pontoFisico && m.pontoFisico.nomeLocal.toLowerCase().includes(term)) ||
              (m.pontoFisico && m.pontoFisico.endereco && m.pontoFisico.endereco.toLowerCase().includes(term)) ||
              campanha.nome.toLowerCase().includes(term);
            if (!match) return false;
          }

          return true;
        });

        return {
          ...campanha,
          midiasExibidas: midiasFiltradas,
        };
      })
      .filter((campanha) => {
        if (!busca) return true;
        const matchName = campanha.nome.toLowerCase().includes(busca.toLowerCase());
        return matchName || campanha.midiasExibidas.length > 0;
      });
  }, [campanhas, empresaSelecionada, tipoMidiaFiltro, apenasAtivos, busca]);

  const handleExcluirMidia = async (midiaId: string) => {
    if (!confirm("Deseja desvincular esta mídia da campanha? O ponto físico voltará a ficar disponível.")) {
      return;
    }
    setExcluindoMidiaId(midiaId);
    try {
      await excluirMidiaCampanha(midiaId);
    } catch (err) {
      console.error("Erro ao remover mídia:", err);
      alert("Erro ao remover mídia.");
    } finally {
      setExcluindoMidiaId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. SELETOR EXTERNO / TOPO: EMPRESAS */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <span>1. Selecione a Empresa:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {empresasList.map((emp) => {
            const isSelected = empresaSelecionada === emp.id;
            let activeStyle = "bg-slate-900 text-white border-slate-900 shadow-sm";

            if (isSelected) {
              if (emp.id === "MAPLE") activeStyle = "bg-[#E11D48] text-white border-[#E11D48] shadow-md shadow-rose-500/20";
              if (emp.id === "UNEF") activeStyle = "bg-[#F59E13] text-slate-950 font-black border-[#F59E13] shadow-md shadow-amber-500/20";
              if (emp.id === "UNIFAN") activeStyle = "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20";
              if (emp.id === "NOBRE") activeStyle = "bg-[#0284C7] text-white border-[#0284C7] shadow-md shadow-sky-500/20";
            }

            return (
              <button
                key={emp.id}
                onClick={() => setEmpresaSelecionada(emp.id)}
                className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected ? activeStyle : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
              >
                {emp.id !== "TODAS" && <span className="w-2 h-2 rounded-full bg-current opacity-80" />}
                <span>{emp.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold ${
                    isSelected ? "bg-black/15 text-inherit" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {emp.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRA DE CONTROLE: SELETOR DE TIPOS DE MÍDIA + BUSCA + TOGGLE APENAS ATIVOS */}
      <div className="executive-card p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* SELETOR DE TIPOS DE MÍDIA */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Tipo de Mídia:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {tiposMidiaOptions.map((opt) => {
                const isSelected = tipoMidiaFiltro === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    onClick={() => setTipoMidiaFiltro(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BUSCA E TOGGLE DE ATIVOS */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            {/* TOGGLE APENAS ATIVOS */}
            <button
              onClick={() => setApenasAtivos(!apenasAtivos)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                apenasAtivos
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center ${
                  apenasAtivos ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                }`}
              >
                {apenasAtivos && <Check className="w-3 h-3" />}
              </div>
              <span>Apenas Mídias Ativas</span>
            </button>

            {/* CAMPO DE BUSCA */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar ponto, rádio, avenida..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3. HIERARQUIA CONSOLIDADA: EMPRESA > NOME DA CAMPANHA > CANAIS / MÍDIAS RODANDO */}
      <div className="space-y-8">
        {campanhasComMidiasFiltradas.length > 0 ? (
          campanhasComMidiasFiltradas.map((campanha) => (
            <div
              key={campanha.id}
              className="executive-card p-6 md:p-8 space-y-6 border-slate-200/90 shadow-sm"
            >
              {/* CABEÇALHO DO BLOCO: EMPRESA > NOME DA CAMPANHA + AÇÕES (EDITAR / EXCLUIR / VINCULAR) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {/* NÍVEL 1: EMPRESA */}
                    <BrandBadge marcaId={campanha.marcaId} className="text-xs px-3 py-1 font-black" />
                    <span className="text-xs font-bold text-slate-400">›</span>
                    {/* NÍVEL 2: STATUS */}
                    <StatusBadge status={campanha.status} />
                  </div>

                  {/* NOME DA CAMPANHA */}
                  <h3 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {campanha.nome}
                  </h3>

                  {campanha.objetivo && (
                    <p className="text-xs text-slate-600 font-medium">
                      {campanha.objetivo}
                    </p>
                  )}
                </div>

                {/* BOTÕES DE AÇÃO: EDITAR, EXCLUIR E VINCULAR MÍDIA */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <VincularMidiaModal
                    campanhaId={campanha.id}
                    marcaId={campanha.marcaId}
                    campanhaNome={campanha.nome}
                    pontosDisponiveis={pontosDisponiveis}
                    fornecedores={fornecedores}
                  />

                  <EditarCampanhaModal campanha={campanha} />

                  <ExcluirCampanhaModal
                    campanhaId={campanha.id}
                    campanhaNome={campanha.nome}
                  />

                  {/* VIGÊNCIA E CONTADOR */}
                  <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Vigência</div>
                      <div className="font-bold text-slate-700 mt-0.5">
                        {formatarData(campanha.dataInicio)} a {formatarData(campanha.dataFim)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NÍVEL 3: CANAIS UTILIZADOS / MÍDIAS RODANDO (CARTÕEZINHOS ENXUTOS E OBJETIVOS) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Canais & Mídias Rodando:</span>
                  <span className="text-slate-400 font-normal font-sans text-xs">
                    {campanha.midiasExibidas.length} item(ns) ativo(s)
                  </span>
                </div>

                {campanha.midiasExibidas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campanha.midiasExibidas.map((midia) => {
                      const temFoto = !!midia.pontoFisico?.fotoLocalUrl;

                      return (
                        <div
                          key={midia.id}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                        >
                          <div className="space-y-2.5">
                            {/* FOTO COMPACTA SE HOUVER */}
                            {temFoto && (
                              <div className="h-32 -mx-4 -mt-4 mb-2.5 rounded-t-2xl overflow-hidden relative border-b border-slate-200 bg-slate-100">
                                <img
                                  src={midia.pontoFisico!.fotoLocalUrl!}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {midia.biSemana && (
                                  <div className="absolute top-2.5 right-2.5">
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/90 text-[10px] text-white font-bold backdrop-blur-sm shadow-sm">
                                      {midia.biSemana}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* CABEÇALHO DO CARTÃOZINHO: QUAL É A MÍDIA + STATUS */}
                            <div className="flex items-center justify-between gap-1.5">
                              <MediaCategoryBadge
                                categoria={midia.categoriaMidia}
                                subtipo={midia.subtipoMidia}
                              />
                              <StatusBadge status={midia.statusVeiculacao} />
                            </div>

                            {/* LOCAL / VEÍCULO & FORMATO */}
                            <div>
                              <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                                {midia.pontoFisico?.nomeLocal || midia.fornecedor.nome}
                              </h4>
                              <div className="text-xs text-blue-700 font-bold mt-0.5">
                                {midia.formatoPeca}
                              </div>
                              {midia.pontoFisico?.endereco && (
                                <p className="text-xs text-slate-600 mt-0.5 flex items-start gap-1">
                                  <span>📍</span>
                                  <span className="line-clamp-1">
                                    {midia.pontoFisico.endereco} ({midia.pontoFisico.bairro})
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* FORNECEDOR / VEÍCULO */}
                            <div className="text-[11px] text-slate-500 font-semibold">
                              Fornecedor: <span className="text-slate-800 font-bold">{midia.fornecedor.nome}</span>
                            </div>
                          </div>

                          {/* RODAPÉ DO CARTÃO: DATA / VIGÊNCIA + WHATSAPP + DESVINCULAR */}
                          <div className="pt-2.5 border-t border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-600 text-[11px]">
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                {formatarData(midia.dataInicio)} a {formatarData(midia.dataFim)}
                              </span>
                              {midia.biSemana && !temFoto && (
                                <span className="font-bold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                  {midia.biSemana}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <CountdownBadge
                                dataFim={midia.dataFim}
                                tipoAcaoFinal={midia.tipoAcaoFinal}
                              />

                              <div className="flex items-center gap-1.5">
                                {midia.fornecedor.whatsapp && (
                                  <a
                                    href={`https://wa.me/55${midia.fornecedor.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-white font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all shrink-0"
                                  >
                                    <Phone className="w-3 h-3" /> WhatsApp
                                  </a>
                                )}

                                <button
                                  onClick={() => handleExcluirMidia(midia.id)}
                                  disabled={excluindoMidiaId === midia.id}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Desvincular esta mídia"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    Nenhuma mídia vinculada ou ativa no momento. Clique em{" "}
                    <span className="font-bold text-blue-600">"+ Vincular Mídia / Ponto"</span> para alocar um outdoor, tela indoor ou rádio para esta campanha.
                  </div>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="executive-card p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div className="font-display font-bold text-slate-800 text-base">
              Nenhuma campanha encontrada.
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Clique no botão <span className="font-bold text-blue-600">"+ Nova Campanha"</span> no topo para criar uma campanha para qualquer empresa do grupo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
