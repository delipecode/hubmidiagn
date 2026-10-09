"use client";

import { useState, useMemo } from "react";
import { BrandBadge, StatusBadge, MediaCategoryBadge, CountdownBadge } from "@/components/BrandBadge";
import { formatarData } from "@/lib/utils";
import Link from "next/link";
import {
  Layers,
  MapPin,
  ArrowLeft,
  Building2,
  Tv,
  Radio,
  Share2,
  Phone,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  Dumbbell,
  MonitorPlay,
  CheckCircle2,
  Clock,
  DollarSign,
  Camera,
  Edit2,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { EditarCampanhaModal } from "@/components/EditarCampanhaModal";
import { ExcluirCampanhaModal } from "@/components/ExcluirCampanhaModal";
import { VincularMidiaModal } from "@/components/VincularMidiaModal";
import { excluirMidiaCampanha } from "@/lib/actions";

interface PontoFisico {
  id: string;
  nomeLocal: string;
  bairro: string;
  endereco: string | null;
  tipoFormato: string;
  fotoLocalUrl: string | null;
  latitude?: number;
  longitude?: number;
}

interface Fornecedor {
  id: string;
  nome: string;
  tipoVeiculo: string;
  whatsapp: string | null;
  email: string | null;
}

interface Checking {
  id: string;
  fotoCheckingUrl: string | null;
  dataChecagem: string;
  status: string;
  observacoes: string | null;
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
  checkings?: Checking[];
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

export function CampanhaDetalheClient({
  campanha,
  pontosDisponiveis = [],
  fornecedores = [],
}: {
  campanha: Campanha;
  pontosDisponiveis?: any[];
  fornecedores?: any[];
}) {
  const [canalFiltro, setCanalFiltro] = useState<string>("TODOS");
  const [busca, setBusca] = useState<string>("");
  const [deletandoMidiaId, setDeletandoMidiaId] = useState<string | null>(null);

  const totalInvestido = useMemo(() => {
    return campanha.midias.reduce((acc, m) => acc + (m.valorNegociado || 0), 0);
  }, [campanha.midias]);

  // Contadores por canal
  const contadores = useMemo(() => {
    let outdoors = 0;
    let radios = 0;
    let indoor = 0;
    let leds = 0;
    let tv = 0;
    let digital = 0;

    campanha.midias.forEach((m) => {
      if (m.subtipoMidia === "OUTDOOR_BISEMANA" || m.subtipoMidia === "BUSDOOR") outdoors++;
      else if (m.subtipoMidia === "RADIO") radios++;
      else if (m.subtipoMidia === "INDOOR_ACADEMIA" || m.subtipoMidia === "INDOOR_TELAS") indoor++;
      else if (m.subtipoMidia === "LED_DIGITAL") leds++;
      else if (m.subtipoMidia === "TV") tv++;
      else if (m.categoriaMidia === "DIGITAL" || m.subtipoMidia === "PORTAL_NOTICIAS") digital++;
    });

    return {
      outdoors,
      radios,
      indoor,
      leds,
      tv,
      digital,
      total: campanha.midias.length,
    };
  }, [campanha.midias]);

  // Filtrar mídias
  const midiasFiltradas = useMemo(() => {
    return campanha.midias.filter((m) => {
      if (busca) {
        const term = busca.toLowerCase();
        const match =
          m.formatoPeca.toLowerCase().includes(term) ||
          m.fornecedor.nome.toLowerCase().includes(term) ||
          (m.pontoFisico && m.pontoFisico.nomeLocal.toLowerCase().includes(term)) ||
          (m.pontoFisico && m.pontoFisico.endereco && m.pontoFisico.endereco.toLowerCase().includes(term));
        if (!match) return false;
      }

      if (canalFiltro === "TODOS") return true;
      if (canalFiltro === "OUTDOOR") return m.subtipoMidia === "OUTDOOR_BISEMANA" || m.subtipoMidia === "BUSDOOR";
      if (canalFiltro === "RADIO") return m.subtipoMidia === "RADIO";
      if (canalFiltro === "INDOOR") return m.subtipoMidia === "INDOOR_ACADEMIA" || m.subtipoMidia === "INDOOR_TELAS";
      if (canalFiltro === "LED") return m.subtipoMidia === "LED_DIGITAL";
      if (canalFiltro === "TV") return m.subtipoMidia === "TV";
      if (canalFiltro === "DIGITAL") return m.categoriaMidia === "DIGITAL" || m.subtipoMidia === "PORTAL_NOTICIAS";
      return true;
    });
  }, [campanha.midias, canalFiltro, busca]);

  async function handleRemoverMidia(midiaId: string) {
    if (confirm("Deseja realmente desvincular esta mídia/ponto desta campanha?")) {
      setDeletandoMidiaId(midiaId);
      try {
        await excluirMidiaCampanha(midiaId);
      } catch (err) {
        console.error(err);
        alert("Erro ao remover mídia.");
      } finally {
        setDeletandoMidiaId(null);
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* NAVEGAÇÃO DE TOPO & AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/campanhas"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Campanhas & Inventário
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <VincularMidiaModal
            campanhaId={campanha.id}
            marcaId={campanha.marcaId}
            campanhaNome={campanha.nome}
            pontosDisponiveis={pontosDisponiveis}
            fornecedores={fornecedores}
          />

          <EditarCampanhaModal campanha={campanha as any} />

          <ExcluirCampanhaModal
            campanhaId={campanha.id}
            campanhaNome={campanha.nome}
          />

          <Link
            href="/pontos"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-blue-600 transition-all shadow-sm"
          >
            <MapPin className="w-4 h-4 text-blue-600" /> Mapa de Mídia
          </Link>
        </div>
      </div>

      {/* CABEÇALHO DO DOSSIÊ DA CAMPANHA */}
      <div className="executive-card p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <BrandBadge marcaId={campanha.marcaId} className="text-xs px-3 py-1 font-bold" />
              <StatusBadge status={campanha.status} />
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {campanha.nome}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {campanha.objetivo || "Dossiê executivo e auditoria territorial e multi-canal."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Vigência</div>
              <div className="font-bold text-slate-800 mt-1 text-xs">
                {formatarData(campanha.dataInicio)} a {formatarData(campanha.dataFim)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Veiculações</div>
              <div className="font-display font-extrabold text-blue-600 mt-0.5 text-base">
                {campanha.midias.length} canais/pontos
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Investimento Total</div>
              <div className="font-bold text-emerald-700 mt-0.5 text-sm">
                {totalInvestido > 0 ? `R$ ${totalInvestido.toLocaleString("pt-BR")}` : "Sob consulta"}
              </div>
            </div>
          </div>
        </div>

        {/* FILTRO DE CANAIS DA CAMPANHA (UNIFICADO) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span>Filtrar por Veículo / Canal:</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar ponto, rádio..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            <button
              onClick={() => setCanalFiltro("TODOS")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "TODOS"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">Todos</div>
              <div className="font-display text-xl font-extrabold">{contadores.total}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("OUTDOOR")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "OUTDOOR"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-blue-50/50 hover:bg-blue-50 text-slate-900 border-blue-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-blue-700 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Outdoors
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.outdoors}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("INDOOR_TELAS")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "INDOOR_TELAS"
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-teal-50/50 hover:bg-teal-50 text-slate-900 border-teal-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-teal-700 flex items-center gap-1">
                <MonitorPlay className="w-3 h-3" /> TV Indoor
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.indoor}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("LED")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "LED"
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-amber-50/50 hover:bg-amber-50 text-slate-900 border-amber-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-1">
                <MonitorPlay className="w-3 h-3" /> Painéis LED
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.leds}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("ACADEMIA")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "ACADEMIA"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-emerald-50/50 hover:bg-emerald-50 text-slate-900 border-emerald-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1">
                <Dumbbell className="w-3 h-3" /> Adesivos / Academias
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.indoor}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("RADIO")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "RADIO"
                  ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                  : "bg-orange-50/50 hover:bg-orange-50 text-slate-900 border-orange-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-orange-700 flex items-center gap-1">
                <Radio className="w-3 h-3" /> Rádios (Spots)
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.radios}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("TV")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "TV"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-indigo-50/50 hover:bg-indigo-50 text-slate-900 border-indigo-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-indigo-700 flex items-center gap-1">
                <Tv className="w-3 h-3" /> TV (VTs)
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.tv}</div>
            </button>

            <button
              onClick={() => setCanalFiltro("DIGITAL")}
              className={`p-3 rounded-xl border text-left transition-all ${
                canalFiltro === "DIGITAL"
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-sky-50/50 hover:bg-sky-50 text-slate-900 border-sky-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-sky-700 flex items-center gap-1">
                <Share2 className="w-3 h-3" /> Digital (Meta)
              </div>
              <div className="font-display text-xl font-extrabold">{contadores.digital}</div>
            </button>
          </div>
        </div>
      </div>

      {/* BLOCO ÚNICO: INVENTÁRIO CONSOLIDADO DA CAMPANHA */}
      <div className="executive-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Locais & Mídias da Campanha ({midiasFiltradas.length})
            </h3>
            <p className="text-xs text-slate-500">
              Relação completa de exibição territorial e digital em execução
            </p>
          </div>

          <VincularMidiaModal
            campanhaId={campanha.id}
            marcaId={campanha.marcaId}
            campanhaNome={campanha.nome}
            pontosDisponiveis={pontosDisponiveis}
            fornecedores={fornecedores}
          />
        </div>

        {midiasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {midiasFiltradas.map((midia) => {
              const temFoto = !!midia.pontoFisico?.fotoLocalUrl;

              return (
                <div
                  key={midia.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {temFoto && (
                      <div className="h-40 -mx-5 -mt-5 mb-3 rounded-t-2xl overflow-hidden relative border-b border-slate-200 bg-slate-100">
                        <img
                          src={midia.pontoFisico!.fotoLocalUrl!}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {midia.biSemana && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-[11px] text-white font-bold backdrop-blur-sm">
                              {midia.biSemana}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <MediaCategoryBadge
                        categoria={midia.categoriaMidia}
                        subtipo={midia.subtipoMidia}
                      />
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={midia.statusVeiculacao} />
                        <button
                          onClick={() => handleRemoverMidia(midia.id)}
                          disabled={deletandoMidiaId === midia.id}
                          title="Remover veiculação da campanha"
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {deletandoMidiaId === midia.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {midia.pontoFisico?.nomeLocal || midia.fornecedor.nome}
                      </h4>
                      <div className="text-xs text-blue-700 font-bold mt-1">
                        Formato: {midia.formatoPeca}
                      </div>
                      {midia.pontoFisico?.endereco && (
                        <p className="text-xs text-slate-600 mt-1 flex items-start gap-1">
                          <span>📍</span>
                          <span>
                            {midia.pontoFisico.endereco} ({midia.pontoFisico.bairro})
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Fornecedor</span>
                        <span className="font-bold text-slate-800">{midia.fornecedor.nome}</span>
                      </div>
                      {midia.numPI && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-[10px] uppercase font-bold text-slate-400">PI / Contrato</span>
                          <span className="font-semibold text-slate-700">{midia.numPI}</span>
                        </div>
                      )}
                      {midia.observacoes && (
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 line-clamp-2 italic">
                          "{midia.observacoes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {formatarData(midia.dataInicio)} a {formatarData(midia.dataFim)}
                      </span>
                      {midia.valorNegociado && (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          R$ {midia.valorNegociado.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <CountdownBadge
                        dataFim={midia.dataFim}
                        tipoAcaoFinal={midia.tipoAcaoFinal}
                      />

                      {midia.fornecedor.whatsapp && (
                        <a
                          href={`https://wa.me/55${midia.fornecedor.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div className="font-display font-bold text-slate-800 text-sm">
              Nenhuma veiculação encontrada para este filtro.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

