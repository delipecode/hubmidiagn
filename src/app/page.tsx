import { getDashboardData } from "@/lib/actions";
import { BrandBadge, CountdownBadge, StatusBadge, MediaCategoryBadge } from "@/components/BrandBadge";
import { ReguaBiSemanasInterativa } from "@/components/ReguaBiSemanasInterativa";
import { formatarData, calcularDiasRestantes } from "@/lib/utils";
import Link from "next/link";
import {
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Share2,
  Sparkles,
  TrendingUp,
  Compass,
  Camera,
  Target,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { midias, pontos, campanhas, fornecedores, checkings } = data;

  const midiasUrgentes = midias.filter((m) => {
    const calc = calcularDiasRestantes(m.dataFim);
    return calc.status === "urgente" || calc.status === "atencao" || calc.status === "vencido";
  });

  const midiasNoAr = midias.filter((m) => m.statusVeiculacao === "No Ar / Ativo");
  const midiasOffNoAr = midiasNoAr.filter((m) => m.categoriaMidia === "OFFLINE");
  const midiasDigitalNoAr = midiasNoAr.filter((m) => m.categoriaMidia === "DIGITAL");

  const totalInvestimento = midias.reduce((acc, m) => acc + (m.valorNegociado || 0), 0);
  const totalOffInvestimento = midiasOffNoAr.reduce((acc, m) => acc + (m.valorNegociado || 0), 0);
  const totalDigInvestimento = midiasDigitalNoAr.reduce((acc, m) => acc + (m.valorNegociado || 0), 0);

  const pctOff = totalInvestimento > 0 ? Math.round((totalOffInvestimento / totalInvestimento) * 100) : 60;
  const pctDig = 100 - pctOff;

  return (
    <div className="space-y-8">
      
      {/* CABEÇALHO DO PAINEL EXECUTIVO - CLEAN LIGHT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Gestão de Mídia • Grupo Nobre</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Painel Executivo de Mídia
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Monitoramento de presença física na rua, academias parceiras e performance digital
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campanhas"
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Raio-X de Campanhas</span>
          </Link>
          <Link
            href="/pontos"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <MapPin className="w-4 h-4 text-white" />
            <span>Central Territorial & OOH</span>
          </Link>
        </div>
      </div>

      {/* BENTO GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        
        {/* BENTO 1: SPLIT DE COBERTURA (OFFLINE VS DIGITAL) - SPAN 2 */}
        <div className="md:col-span-2 executive-card p-6 md:p-7 space-y-6 flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Split Estratégico de Mídia
              </span>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Distribuição de Presença & Canais
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              {midiasNoAr.length} canais no ar
            </span>
          </div>

          {/* BARRA DE PROGRESSO DUPLA */}
          <div className="space-y-2.5">
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
              <div
                style={{ width: `${pctOff}%` }}
                className="h-full bg-blue-600 rounded-l-full"
              />
              <div
                style={{ width: `${pctDig}%` }}
                className="h-full bg-sky-400 rounded-r-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="font-bold text-slate-800">Offline & OOH ({pctOff}%)</span>
                <span className="text-slate-500 font-semibold">
                  R$ {totalOffInvestimento.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span className="font-bold text-slate-800">Digital & Portais ({pctDig}%)</span>
                <span className="text-slate-500 font-semibold">
                  R$ {totalDigInvestimento.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {/* CAIXAS DE DESTAQUE COM CORES SÓLIDAS */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-600 font-bold uppercase flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Mídia Física
              </div>
              <div className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                {midiasOffNoAr.length} <span className="text-xs text-slate-500 font-normal">pontos</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Outdoors, Academias, LEDs</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-600 font-bold uppercase flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-sky-600" /> Mídia Digital
              </div>
              <div className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                {midiasDigitalNoAr.length} <span className="text-xs text-slate-500 font-normal">canais</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Meta Ads, Google, Portais</div>
            </div>
          </div>
        </div>

        {/* BENTO 2: RADAR DE ALERTAS CRÍTICOS (7 DIAS) */}
        <div className="executive-card p-6 space-y-4 flex flex-col justify-between border-rose-200 bg-rose-50/40 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Radar de Prazos
            </span>
            <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-md bg-rose-600">
              7 Dias
            </span>
          </div>

          <div>
            <div className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
              {midiasUrgentes.length}
            </div>
            <div className="text-xs font-bold text-rose-900 mt-1">
              Veiculações exigindo ação imediata
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Troca de lonas para nova BS, desmobilização de adesivos ou renovação.
            </p>
          </div>

          <Link
            href="/campanhas"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span>Verificar Ações</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* BENTO 3: CHECKING FOTOGRÁFICO */}
        <div className="executive-card p-6 space-y-4 flex flex-col justify-between border-blue-200 bg-blue-50/40 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" /> Checking
            </span>
            <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-md bg-blue-600">
              {checkings.length} fotos
            </span>
          </div>

          <div>
            <div className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
              {checkings.filter((c) => c.status === "Aprovado").length}
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              Comprovações Aprovadas
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Fotos de rua e academias validadas pela equipe de marketing.
            </p>
          </div>

          <Link
            href="/pontos"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span>Mural de Fotos</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* SEÇÃO BENTO 2: RÉGUA INTERATIVA DE BI-SEMANAS 2026 */}
      <ReguaBiSemanasInterativa midias={midias} pontos={pontos} />

      {/* SEÇÃO BENTO 3: DOSSIER DE AÇÕES IMEDIATAS */}
      <div className="executive-card p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-0.5">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600" />
              Ações Operacionais dos Próximos 7 Dias
            </h3>
            <p className="text-xs text-slate-600">
              Itens que exigem envio de nova arte, desmobilização ou renovação com o parceiro
            </p>
          </div>
          <Link
            href="/campanhas"
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 group"
          >
            <span>Ver todas</span> <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {midiasUrgentes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {midiasUrgentes.map((midia) => (
              <div
                key={midia.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <BrandBadge marcaId={midia.marcaId} />
                    <CountdownBadge dataFim={midia.dataFim} tipoAcaoFinal={midia.tipoAcaoFinal} />
                  </div>

                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {midia.campanha?.nome}
                    </h4>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      {midia.formatoPeca} • {midia.pontoFisico?.nomeLocal || midia.fornecedor.nome}
                    </div>
                    {midia.pontoFisico?.endereco && (
                      <p className="text-xs text-slate-500 mt-1">
                        📍 {midia.pontoFisico.endereco} ({midia.pontoFisico.bairro})
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-500">Ação:</span>{" "}
                    <span className="text-slate-900 font-bold">{midia.tipoAcaoFinal}</span>
                  </div>
                  {midia.fornecedor?.whatsapp && (
                    <a
                      href={`https://wa.me/55${midia.fornecedor.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white hover:bg-emerald-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 shadow-sm"
                    >
                      <span>WhatsApp Parceiro</span> <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-display font-bold text-slate-800 text-sm">
              Nenhuma ação operacional urgente pendente para os próximos 7 dias.
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              O inventário territorial com 29 pontos físicos e fornecedores catalogados está mapeado e disponível para planejamento.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
