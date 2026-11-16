"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  Info,
  CalendarDays,
  Zap,
} from "lucide-react";
import {
  BiSemana,
  getBiSemanasAno,
  getBiSemanaAtual,
  getProximaBiSemana,
  encontrarBiSemanaPorTexto,
} from "@/lib/bissemanas";
import { cn } from "@/lib/utils";

interface SeletorBiSemanaCalendarioProps {
  biSemanaSelecionada: string;
  dataInicio: string;
  dataFim: string;
  onSelecionarBiSemana: (bs: BiSemana) => void;
  subtipoMidia?: string;
}

export function SeletorBiSemanaCalendario({
  biSemanaSelecionada,
  dataInicio,
  dataFim,
  onSelecionarBiSemana,
  subtipoMidia = "OUTDOOR_BISEMANA",
}: SeletorBiSemanaCalendarioProps) {
  const [anoCalendario, setAnoCalendario] = useState(2026);
  const [gradeAberta, setGradeAberta] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<"TODAS" | "ATIVAS_FUTURAS" | "ENCERRADAS">("ATIVAS_FUTURAS");

  // Bi-Semana atual baseada na data de hoje (ou nov/2026)
  const biSemanaAtual = useMemo(() => getBiSemanaAtual(), []);
  const proximaBiSemana = useMemo(() => getProximaBiSemana(), []);

  // Lista de Bi-Semanas do ano selecionado
  const todasBiSemanas = useMemo(() => {
    return getBiSemanasAno(anoCalendario);
  }, [anoCalendario]);

  // Bi-Semana atualmente ativa pelo valor selecionado no modal
  const bsAtiva = useMemo(() => {
    return encontrarBiSemanaPorTexto(biSemanaSelecionada, anoCalendario);
  }, [biSemanaSelecionada, anoCalendario]);

  // Se nada foi selecionado ainda, define a atual automaticamente na inicialização
  useEffect(() => {
    if (!biSemanaSelecionada && biSemanaAtual) {
      onSelecionarBiSemana(biSemanaAtual);
    }
  }, [biSemanaSelecionada, biSemanaAtual, onSelecionarBiSemana]);

  // Cálculo da quantidade de dias de veiculação das datas atuais
  const diasDuracao = useMemo(() => {
    if (!dataInicio || !dataFim) return 14;
    const ini = new Date(`${dataInicio}T12:00:00Z`).getTime();
    const fim = new Date(`${dataFim}T12:00:00Z`).getTime();
    const diff = Math.round((fim - ini) / (24 * 60 * 60 * 1000)) + 1;
    return diff > 0 ? diff : 14;
  }, [dataInicio, dataFim]);

  const biSemanasFiltradas = useMemo(() => {
    if (filtroStatus === "ATIVAS_FUTURAS") {
      return todasBiSemanas.filter((b) => b.status === "ATUAL" || b.status === "PROXIMA" || b.status === "FUTURA");
    }
    if (filtroStatus === "ENCERRADAS") {
      return todasBiSemanas.filter((b) => b.status === "ENCERRADA");
    }
    return todasBiSemanas;
  }, [todasBiSemanas, filtroStatus]);

  const ehOutdoor = subtipoMidia === "OUTDOOR_BISEMANA" || subtipoMidia === "BUSDOOR";

  return (
    <div className="rounded-2xl border border-blue-200/90 bg-linear-to-b from-blue-50/70 to-white p-3.5 space-y-3 shadow-xs">
      {/* CABEÇALHO DO AGENDADOR */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                Programação por Bi-Semana Oficial
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                Ano {anoCalendario}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Conectado ao calendário anual de 14 dias com escopo automático de datas.
            </p>
          </div>
        </div>

        {/* INDICADOR DA BS ATIVA HOJE NO CALENDÁRIO */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Hoje: BS {biSemanaAtual.numero} ({biSemanaAtual.periodo})</span>
        </div>
      </div>

      {/* BOTÕES DE PRÉ-SELEÇÃO RÁPIDA (CONECTADOS AO CALENDÁRIO) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 block">
          Pré-seleção Rápida de Vigência (Clique para aplicar o escopo):
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* BOTÃO 1: BI-SEMANA ATUAL */}
          <button
            type="button"
            onClick={() => onSelecionarBiSemana(biSemanaAtual)}
            className={cn(
              "text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer",
              biSemanaSelecionada.includes(`BS ${biSemanaAtual.numero}`)
                ? "bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-400/50"
                : "bg-white hover:bg-blue-50 text-slate-800 border-slate-200"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-1",
                  biSemanaSelecionada.includes(`BS ${biSemanaAtual.numero}`)
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                )}
              >
                <Zap className="w-2.5 h-2.5 fill-current" /> No Ar Agora
              </span>
              {biSemanaSelecionada.includes(`BS ${biSemanaAtual.numero}`) && (
                <Check className="w-3.5 h-3.5" />
              )}
            </div>
            <strong className="text-xs font-black block">BS {biSemanaAtual.numero} (Atual)</strong>
            <span
              className={cn(
                "text-[11px] font-semibold mt-0.5 block truncate",
                biSemanaSelecionada.includes(`BS ${biSemanaAtual.numero}`)
                  ? "text-blue-100"
                  : "text-slate-500"
              )}
            >
              {biSemanaAtual.periodo}
            </span>
          </button>

          {/* BOTÃO 2: PRÓXIMA BI-SEMANA */}
          <button
            type="button"
            onClick={() => onSelecionarBiSemana(proximaBiSemana)}
            className={cn(
              "text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer",
              biSemanaSelecionada.includes(`BS ${proximaBiSemana.numero}`)
                ? "bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-400/50"
                : "bg-white hover:bg-blue-50 text-slate-800 border-slate-200"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded",
                  biSemanaSelecionada.includes(`BS ${proximaBiSemana.numero}`)
                    ? "bg-white/20 text-white"
                    : "bg-sky-100 text-sky-800"
                )}
              >
                Próxima a Entrar
              </span>
              {biSemanaSelecionada.includes(`BS ${proximaBiSemana.numero}`) && (
                <Check className="w-3.5 h-3.5" />
              )}
            </div>
            <strong className="text-xs font-black block">BS {proximaBiSemana.numero} (Próxima)</strong>
            <span
              className={cn(
                "text-[11px] font-semibold mt-0.5 block truncate",
                biSemanaSelecionada.includes(`BS ${proximaBiSemana.numero}`)
                  ? "text-blue-100"
                  : "text-slate-500"
              )}
            >
              {proximaBiSemana.periodo}
            </span>
          </button>

          {/* BOTÃO 3: EXPANDIR CALENDÁRIO COMPLETO */}
          <button
            type="button"
            onClick={() => setGradeAberta((prev) => !prev)}
            className={cn(
              "text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer",
              gradeAberta
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded",
                  gradeAberta ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                )}
              >
                Tabela Anual
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  gradeAberta ? "rotate-180" : ""
                )}
              />
            </div>
            <strong className="text-xs font-black block">Todas as Bi-Semanas</strong>
            <span
              className={cn(
                "text-[11px] font-semibold mt-0.5 block truncate",
                gradeAberta ? "text-slate-300" : "text-slate-500"
              )}
            >
              {gradeAberta ? "Ocultar catálogo" : "Abrir BS 01 a BS 26"}
            </span>
          </button>
        </div>
      </div>

      {/* GRADE EXPANSÍVEL DE TODAS AS BI-SEMANAS DO ANO */}
      {gradeAberta && (
        <div className="pt-3 border-t border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Escolha a Bi-Semana no Calendário {anoCalendario}:</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setFiltroStatus("ATIVAS_FUTURAS")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all",
                    filtroStatus === "ATIVAS_FUTURAS"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Ativas & Futuras
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroStatus("TODAS")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all",
                    filtroStatus === "TODAS"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Todas (26 BS)
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroStatus("ENCERRADAS")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all",
                    filtroStatus === "ENCERRADAS"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Passadas
                </button>
              </div>

              {/* CONTROLE DE ANO */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setAnoCalendario((a) => a - 1)}
                  className="px-1 text-slate-500 hover:text-slate-900"
                  title="Ano anterior"
                >
                  ◀
                </button>
                <span className="text-slate-800">{anoCalendario}</span>
                <button
                  type="button"
                  onClick={() => setAnoCalendario((a) => a + 1)}
                  className="px-1 text-slate-500 hover:text-slate-900"
                  title="Próximo ano"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto pr-1">
            {biSemanasFiltradas.map((bs) => {
              const selecionada =
                biSemanaSelecionada.includes(`BS ${bs.numero}`) ||
                biSemanaSelecionada.includes(`BS${bs.numero}`);

              return (
                <button
                  key={bs.numero}
                  type="button"
                  onClick={() => {
                    onSelecionarBiSemana(bs);
                    setGradeAberta(false);
                  }}
                  className={cn(
                    "p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer",
                    selecionada
                      ? "bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-300"
                      : bs.status === "ATUAL"
                      ? "bg-emerald-50 text-emerald-950 border-emerald-300 hover:border-emerald-500"
                      : bs.status === "PROXIMA"
                      ? "bg-sky-50 text-sky-950 border-sky-300 hover:border-sky-500"
                      : bs.status === "ENCERRADA"
                      ? "bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100"
                      : "bg-white text-slate-800 border-slate-200 hover:border-blue-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-black">BS {bs.numero}</span>
                    {bs.status === "ATUAL" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ativa Hoje" />
                    )}
                    {bs.status === "PROXIMA" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="Próxima" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold truncate",
                      selecionada ? "text-blue-100" : "text-slate-500"
                    )}
                  >
                    {bs.periodo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FEEDBACK DE ESCOPO ATIVO DEFINIDO PELO CALENDÁRIO */}
      <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-slate-800">
              Escopo Definido:{" "}
              <strong className="text-blue-700 font-extrabold">
                {biSemanaSelecionada || `BS ${biSemanaAtual.numero} (${biSemanaAtual.periodo})`}
              </strong>
            </span>
            <span className="text-[11px] text-slate-500 block">
              Período de veiculação: <strong>{dataInicio ? dataInicio.split("-").reverse().join("/") : ""}</strong> até{" "}
              <strong>{dataFim ? dataFim.split("-").reverse().join("/") : ""}</strong> ({diasDuracao} dias)
            </span>
          </div>
        </div>

        {bsAtiva && (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
            Colagem oficial: {bsAtiva.colagem}
          </span>
        )}
      </div>
    </div>
  );
}
