"use client";

import { useState } from "react";
import { BrandBadge, StatusBadge, CountdownBadge, MediaCategoryBadge } from "@/components/BrandBadge";
import { formatarData } from "@/lib/utils";
import Link from "next/link";
import {
  CalendarCheck,
  MapPin,
  Building2,
  Phone,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Layers,
  ChevronRight,
  Printer,
  Truck,
} from "lucide-react";

interface ReguaBiSemanasProps {
  midias: any[];
  pontos: any[];
}

export function ReguaBiSemanasInterativa({ midias, pontos }: ReguaBiSemanasProps) {
  const [bsSelecionada, setBsSelecionada] = useState("21");

  const biSemanas2026 = [
    {
      numero: "20",
      periodo: "22/09 a 05/10",
      status: "Encerrada",
      ativa: false,
      prazoLona: "Concluído",
      colagem: "21/09 (Dom)",
      descolagem: "05/10 (Dom)",
    },
    {
      numero: "21",
      periodo: "06/10 a 19/10",
      status: "No Ar Agora",
      ativa: true,
      prazoLona: "Em exibição na rua",
      colagem: "05/10 (Dom)",
      descolagem: "19/10 (Dom)",
    },
    {
      numero: "22",
      periodo: "20/10 a 02/11",
      status: "Envio de Lonas",
      ativa: false,
      prazoLona: "Entregar lonas até 16/10 (Qui)",
      colagem: "19/10 (Dom)",
      descolagem: "02/11 (Dom)",
    },
    {
      numero: "23",
      periodo: "03/11 a 16/11",
      status: "Programada",
      ativa: false,
      prazoLona: "Aprovação de arte até 28/10",
      colagem: "02/11 (Dom)",
      descolagem: "16/11 (Dom)",
    },
    {
      numero: "24",
      periodo: "17/11 a 30/11",
      status: "Programada",
      ativa: false,
      prazoLona: "Aprovação de arte até 11/11",
      colagem: "16/11 (Dom)",
      descolagem: "30/11 (Dom)",
    },
  ];

  const infoBs = biSemanas2026.find((b) => b.numero === bsSelecionada) || biSemanas2026[1];

  const midiasDaBS = midias.filter((m) => {
    if (m.categoriaMidia !== "OFFLINE") return false;
    const strBS = (m.biSemana || "").toLowerCase();
    return strBS.includes(`bs ${bsSelecionada}`) || strBS.includes(`bs${bsSelecionada}`) || (bsSelecionada === "21" && m.statusVeiculacao === "No Ar / Ativo");
  });

  const marcasNaBS = midiasDaBS.reduce((acc: Record<string, number>, m) => {
    acc[m.marcaId] = (acc[m.marcaId] || 0) + 1;
    return acc;
  }, {});

  const totalInvestimentoBS = midiasDaBS.reduce((acc, m) => acc + (m.valorNegociado || 0), 0);

  return (
    <div className="executive-card p-6 md:p-8 space-y-6 relative overflow-hidden">
      
      {/* CABEÇALHO DA RÉGUA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-display text-lg font-bold text-slate-900">
              Régua Interativa de Bi-Semanas OOH 2026
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Clique em qualquer Bi-Semana para inspecionar as placas ativas, cronograma de colagem e distribuição por marca
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-950 font-bold px-3 py-1 rounded-xl bg-amber-400 shadow-sm">
            BS 21 Ativa no Momento
          </span>
        </div>
      </div>

      {/* CARDS CLICÁVEIS DA LINHA DO TEMPO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {biSemanas2026.map((bs) => {
          const isSelected = bsSelecionada === bs.numero;

          return (
            <button
              key={bs.numero}
              type="button"
              onClick={() => setBsSelecionada(bs.numero)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                  : bs.ativa
                  ? "bg-blue-50/70 border-blue-300 text-slate-900 hover:border-blue-400 hover:bg-blue-50"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-display text-base font-extrabold tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                  BS {bs.numero}
                </span>
                {bs.ativa && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <div className={`text-xs font-bold mt-2 ${isSelected ? "text-blue-100" : "text-slate-600"}`}>
                {bs.periodo}
              </div>

              <div className={`mt-3 pt-2 border-t text-[11px] flex items-center justify-between font-bold ${
                isSelected ? "border-white/20 text-white" : "border-slate-200 text-slate-500"
              }`}>
                <span>Status:</span>
                <span
                  className={
                    bs.ativa
                      ? isSelected ? "text-emerald-300 font-extrabold" : "text-emerald-700 font-extrabold"
                      : isSelected
                      ? "text-blue-100 font-bold"
                      : "text-slate-600"
                  }
                >
                  {bs.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* PAINEL DINÂMICO DE DETALHES DA BI-SEMANA SELECIONADA */}
      <div className="p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
        
        {/* RESUMO EXECUTIVO DA BS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-slate-900">
                Raio-X Operacional da BS {infoBs.numero} ({infoBs.periodo})
              </span>
              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-600 text-white">
                {infoBs.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Colagem oficial: <strong className="text-slate-900">{infoBs.colagem}</strong> • Descolagem: <strong className="text-slate-900">{infoBs.descolagem}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Total nesta BS</span>
              <div className="font-display text-lg font-bold text-slate-900">
                {midiasDaBS.length} placas / pontos
              </div>
            </div>

            <Link
              href="/pontos"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Ver no Mapa</span>
            </Link>
          </div>
        </div>

        {/* CAIXAS COLORIDAS DE MARCA COM ALTO CONTRASTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* CAIXA PRAZO */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-blue-600" /> Prazo Gráfica / Lona
            </span>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {infoBs.prazoLona}
            </div>
          </div>

          {/* CAIXA UNEF */}
          <div className="p-4 rounded-2xl bg-[#F59E13] text-slate-950 shadow-sm">
            <span className="text-[11px] uppercase font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" /> UNEF
            </span>
            <div className="font-display text-2xl font-black mt-0.5">
              {marcasNaBS["UNEF"] || 0} <span className="text-xs font-sans font-bold">faces</span>
            </div>
          </div>

          {/* CAIXA UNIFAN */}
          <div className="p-4 rounded-2xl bg-[#2563EB] text-white shadow-sm">
            <span className="text-[11px] uppercase font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" /> UNIFAN
            </span>
            <div className="font-display text-2xl font-black mt-0.5">
              {marcasNaBS["UNIFAN"] || 0} <span className="text-xs font-sans font-bold">faces</span>
            </div>
          </div>

          {/* CAIXA NOBRE & MAPLE */}
          <div className="p-4 rounded-2xl bg-[#0284C7] text-white shadow-sm">
            <span className="text-[11px] uppercase font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" /> NOBRE & MAPLE
            </span>
            <div className="font-display text-2xl font-black mt-0.5">
              {(marcasNaBS["NOBRE"] || 0) + (marcasNaBS["MAPLE"] || 0)} <span className="text-xs font-sans font-bold">faces</span>
            </div>
          </div>

        </div>

        {/* LISTA DAS PLACAS E PONTOS ATIVOS NASTA BS */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">
              Placas & Mídias Físicas Escaladas para BS {infoBs.numero} ({midiasDaBS.length})
            </span>
            {totalInvestimentoBS > 0 && (
              <span className="text-xs text-slate-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                Investimento: R$ {totalInvestimentoBS.toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {midiasDaBS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {midiasDaBS.map((midia) => (
                <div
                  key={midia.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    {midia.pontoFisico?.fotoLocalUrl && (
                      <div className="h-32 -mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden relative border-b border-slate-200 bg-slate-100">
                        <img
                          src={midia.pontoFisico.fotoLocalUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <BrandBadge marcaId={midia.marcaId} />
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900/90 text-xs font-bold text-white">
                            BS {infoBs.numero}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {!midia.pontoFisico?.fotoLocalUrl && (
                        <div className="flex items-center justify-between">
                          <BrandBadge marcaId={midia.marcaId} />
                          <StatusBadge status={midia.statusVeiculacao} />
                        </div>
                      )}

                      <h4 className="font-display font-bold text-sm text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {midia.pontoFisico?.nomeLocal || midia.fornecedor.nome}
                      </h4>

                      <div className="text-xs text-slate-600 font-semibold">
                        {midia.formatoPeca}
                      </div>

                      {midia.pontoFisico?.endereco && (
                        <p className="text-xs text-slate-500 font-sans">
                          📍 {midia.pontoFisico.endereco} ({midia.pontoFisico.bairro})
                        </p>
                      )}

                      <div className="text-xs font-semibold text-slate-600 pt-1">
                        Campanha: <span className="text-slate-900 font-bold">{midia.campanha?.nome}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-xs truncate max-w-[130px]">
                      {midia.fornecedor?.nome}
                    </span>

                    {midia.fornecedor?.whatsapp && (
                      <a
                        href={`https://wa.me/55${midia.fornecedor.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" /> WhatsApp Exibidora
                      </a>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center text-xs text-slate-500 font-medium">
              Nenhuma placa física vinculada a esta Bi-Semana (BS {infoBs.numero}) no momento.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
