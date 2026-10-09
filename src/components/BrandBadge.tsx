import { cn } from "@/lib/utils";

interface BrandBadgeProps {
  marcaId: string;
  className?: string;
}

export function BrandBadge({ marcaId, className }: BrandBadgeProps) {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; dot: string; glow: string }
  > = {
    UNEF: {
      label: "UNEF",
      bg: "bg-[#F59E13]",
      text: "text-slate-950 font-black",
      border: "border-amber-500",
      dot: "bg-slate-950",
      glow: "shadow-sm shadow-amber-500/20",
    },
    UNIFAN: {
      label: "UNIFAN",
      bg: "bg-[#2563EB]",
      text: "text-white font-black",
      border: "border-blue-600",
      dot: "bg-white",
      glow: "shadow-sm shadow-blue-500/20",
    },
    NOBRE: {
      label: "Colégio Nobre",
      bg: "bg-[#0284C7]",
      text: "text-white font-black",
      border: "border-sky-600",
      dot: "bg-white",
      glow: "shadow-sm shadow-sky-500/20",
    },
    MAPLE: {
      label: "Maple Bear",
      bg: "bg-[#E11D48]",
      text: "text-white font-black",
      border: "border-rose-600",
      dot: "bg-white",
      glow: "shadow-sm shadow-rose-500/20",
    },
  };

  const config = configs[marcaId] || {
    label: marcaId,
    bg: "bg-slate-800",
    text: "text-white font-bold",
    border: "border-slate-700",
    dot: "bg-white",
    glow: "",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all",
        config.bg,
        config.text,
        config.border,
        config.glow,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  let style = "bg-slate-100 text-slate-800 border-slate-200";
  let dot = "bg-slate-500";

  if (status === "No Ar / Ativo" || status === "Ativa" || status === "Comprado / Ativo" || status === "Aprovado") {
    style = "bg-emerald-100 text-emerald-900 font-bold border-emerald-300";
    dot = "bg-emerald-600";
  } else if (status === "Disponível / Mapeado") {
    style = "bg-blue-100 text-blue-900 font-bold border-blue-300";
    dot = "bg-blue-600";
  } else if (status === "Planejada" || status === "Planejado" || status === "Recebido" || status === "Em Produção") {
    style = "bg-amber-100 text-amber-900 font-bold border-amber-300";
    dot = "bg-amber-600";
  } else if (status === "Desmobilizado / Encerrado" || status === "Concluída") {
    style = "bg-slate-100 text-slate-600 border-slate-300";
    dot = "bg-slate-400";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border",
        style
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {status}
    </span>
  );
}

export function MediaCategoryBadge({
  categoria,
  subtipo,
}: {
  categoria: string;
  subtipo?: string | null;
}) {
  const subtiposConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    OUTDOOR_BISEMANA: { label: "Outdoor (Bi-Semana)", bg: "bg-blue-50", text: "text-blue-900 font-bold", border: "border-blue-200", dot: "bg-blue-600" },
    INDOOR_ACADEMIA: { label: "Mídia Indoor • Academia", bg: "bg-emerald-50", text: "text-emerald-900 font-bold", border: "border-emerald-200", dot: "bg-emerald-600" },
    INDOOR_TELAS: { label: "Mídia Indoor • Telas Digitais", bg: "bg-teal-50", text: "text-teal-900 font-bold", border: "border-teal-200", dot: "bg-teal-600" },
    LED_DIGITAL: { label: "Painel de LED Digital", bg: "bg-amber-50", text: "text-amber-900 font-bold", border: "border-amber-200", dot: "bg-amber-600" },
    RADIO: { label: "Rádio FM/AM", bg: "bg-orange-50", text: "text-orange-900 font-bold", border: "border-orange-200", dot: "bg-orange-600" },
    TV: { label: "Mídia de TV", bg: "bg-indigo-50", text: "text-indigo-900 font-bold", border: "border-indigo-200", dot: "bg-indigo-600" },
    BUSDOOR: { label: "Busdoor", bg: "bg-yellow-50", text: "text-yellow-900 font-bold", border: "border-yellow-200", dot: "bg-yellow-600" },
    META_ADS: { label: "Meta Ads (Feed/Stories)", bg: "bg-sky-50", text: "text-sky-900 font-bold", border: "border-sky-200", dot: "bg-sky-600" },
    GOOGLE_ADS: { label: "Google Ads & YouTube", bg: "bg-red-50", text: "text-red-900 font-bold", border: "border-red-200", dot: "bg-red-600" },
    PORTAL_NOTICIAS: { label: "Portal de Notícias", bg: "bg-cyan-50", text: "text-cyan-900 font-bold", border: "border-cyan-200", dot: "bg-cyan-600" },
  };

  const config = (subtipo && subtiposConfig[subtipo]) || {
    label: subtipo || categoria,
    bg: categoria === "OFFLINE" ? "bg-slate-100" : "bg-sky-50",
    text: categoria === "OFFLINE" ? "text-slate-800 font-bold" : "text-sky-900 font-bold",
    border: "border-slate-200",
    dot: categoria === "OFFLINE" ? "bg-slate-600" : "bg-sky-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider border transition-all",
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function CountdownBadge({
  dataFim,
  tipoAcaoFinal,
}: {
  dataFim: string;
  tipoAcaoFinal?: string | null;
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fim = new Date(dataFim);
  fim.setHours(0, 0, 0, 0);

  const diffMs = fim.getTime() - hoje.getTime();
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        Vencido ({Math.abs(dias)}d atrás)
      </span>
    );
  }

  if (dias <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black border border-rose-500 shadow-sm shadow-rose-600/30 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        {dias === 0 ? "Vence HOJE" : `Faltam ${dias} dias`} ({tipoAcaoFinal || "Ação"})
      </span>
    );
  }

  if (dias <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        Faltam {dias} dias ({tipoAcaoFinal || "Ação"})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {dias} dias restantes
    </span>
  );
}
