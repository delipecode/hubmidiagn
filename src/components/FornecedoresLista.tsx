"use client";

import { useState, useMemo } from "react";
import { BrandBadge, StatusBadge, MediaCategoryBadge, CountdownBadge } from "@/components/BrandBadge";
import { formatarData } from "@/lib/utils";
import {
  Building2,
  Phone,
  Mail,
  FileCode,
  Share2,
  Clock,
  MapPin,
  Camera,
  X,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Radio,
  Tv,
  MonitorPlay,
  Volume2,
  Printer,
  Gift,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface FornecedoresListaProps {
  fornecedores: any[];
}

type CategoriaFiltro =
  | "TODOS"
  | "OUTDOOR"
  | "RADIO"
  | "LED_INDOOR"
  | "TV"
  | "DIGITAL"
  | "PRODUTORAS"
  | "GRAFICAS"
  | "BRINDES_ESTRUTURAS";

export function FornecedoresLista({ fornecedores }: FornecedoresListaProps) {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<any | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaFiltro>("TODOS");
  const [busca, setBusca] = useState("");

  // Categorização Inteligente e Robusta
  const categorizarFornecedor = (forn: any): CategoriaFiltro => {
    const nome = (forn.nome || "").toLowerCase();
    const tipo = (forn.tipoVeiculo || "").toLowerCase();
    const specs = (forn.specsTecnicas || "").toLowerCase();

    if (
      tipo.includes("tv") ||
      nome.includes("tv subaé") ||
      nome.includes("afiliada globo") ||
      nome.includes("tv")
    ) {
      return "TV";
    }

    if (
      tipo.includes("led") ||
      tipo.includes("indoor") ||
      tipo.includes("telas") ||
      tipo.includes("academia") ||
      tipo.includes("espelho") ||
      nome.includes("academia") ||
      nome.includes("biohit") ||
      nome.includes("fitness") ||
      nome.includes("feirafit") ||
      nome.includes("henkley") ||
      nome.includes("girlan") ||
      nome.includes("led") ||
      nome.includes("telas indoor") ||
      specs.includes("espelho") ||
      specs.includes("catraca") ||
      specs.includes("academia")
    ) {
      return "LED_INDOOR";
    }

    if (
      tipo.includes("rádio") ||
      tipo.includes("radio") ||
      nome.includes("rádio") ||
      nome.includes("radio") ||
      nome.includes("fm") ||
      nome.includes("jovem pan") ||
      nome.includes("sociedade") ||
      nome.includes("princesa") ||
      nome.includes("transbrasil") ||
      nome.includes("acorda cidade") ||
      nome.includes("lomes") ||
      nome.includes("subaé")
    ) {
      return "RADIO";
    }

    if (
      tipo.includes("outdoor") ||
      tipo.includes("ooh") ||
      nome.includes("outdoor") ||
      nome.includes("bullos") ||
      nome.includes("vitrine") ||
      nome.includes("via urbana") ||
      nome.includes("preserv") ||
      nome.includes("estação") ||
      nome.includes("subaé (outdoor)") ||
      tipo.includes("ônibus") ||
      tipo.includes("busdoor") ||
      nome.includes("maria e joão")
    ) {
      return "OUTDOOR";
    }

    if (
      forn.categoriaGeral === "DIGITAL" ||
      tipo.includes("digital") ||
      tipo.includes("tráfego") ||
      tipo.includes("portal") ||
      nome.includes("meta") ||
      nome.includes("google") ||
      nome.includes("alexandre")
    ) {
      return "DIGITAL";
    }

    if (
      tipo.includes("produtora") ||
      tipo.includes("áudio") ||
      tipo.includes("audio") ||
      tipo.includes("locução") ||
      tipo.includes("locucao") ||
      nome.includes("praise") ||
      nome.includes("corujas") ||
      nome.includes("fábrica do som") ||
      nome.includes("fresh") ||
      nome.includes("interanima") ||
      nome.includes("coyote")
    ) {
      return "PRODUTORAS";
    }

    if (
      tipo.includes("gráfica") ||
      tipo.includes("grafica") ||
      tipo.includes("comunicação visual") ||
      tipo.includes("comunicacao visual") ||
      tipo.includes("impress") ||
      tipo.includes("papel") ||
      nome.includes("play") ||
      nome.includes("proart") ||
      nome.includes("inprimer") ||
      nome.includes("emgraf") ||
      nome.includes("plantão") ||
      nome.includes("tonny") ||
      nome.includes("lá grafic")
    ) {
      return "GRAFICAS";
    }

    return "BRINDES_ESTRUTURAS";
  };

  // Metadados dos filtros
  const categoriasMeta = [
    { id: "TODOS", label: "Todos os Fornecedores", icon: Building2, color: "bg-slate-900 text-white" },
    { id: "OUTDOOR", label: "Outdoors & OOH", icon: MapPin, color: "bg-amber-600 text-white" },
    { id: "RADIO", label: "Rádios", icon: Radio, color: "bg-blue-600 text-white" },
    { id: "LED_INDOOR", label: "Mídia Indoor (Telas, LEDs & Academias)", icon: MonitorPlay, color: "bg-indigo-600 text-white" },
    { id: "TV", label: "Mídia de TV", icon: Tv, color: "bg-rose-600 text-white" },
    { id: "DIGITAL", label: "Digital & Performance", icon: Share2, color: "bg-sky-600 text-white" },
    { id: "PRODUTORAS", label: "Produtoras (Áudio & Vídeo)", icon: Volume2, color: "bg-purple-600 text-white" },
    { id: "GRAFICAS", label: "Gráficas & Comunicação Visual", icon: Printer, color: "bg-teal-600 text-white" },
    { id: "BRINDES_ESTRUTURAS", label: "Brindes & Estruturas", icon: Gift, color: "bg-slate-700 text-white" },
  ];

  // Contagem por categoria
  const contagens = useMemo(() => {
    const counts: Record<string, number> = {
      TODOS: fornecedores.length,
      OUTDOOR: 0,
      RADIO: 0,
      LED_INDOOR: 0,
      TV: 0,
      DIGITAL: 0,
      PRODUTORAS: 0,
      GRAFICAS: 0,
      BRINDES_ESTRUTURAS: 0,
    };

    fornecedores.forEach((f) => {
      const cat = categorizarFornecedor(f);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return counts;
  }, [fornecedores]);

  // Filtragem combinada de Categoria + Busca
  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter((forn) => {
      const cat = categorizarFornecedor(forn);
      const matchCat = categoriaAtiva === "TODOS" || cat === categoriaAtiva;

      const textoBusca = `${forn.nome} ${forn.tipoVeiculo} ${forn.contatoNome || ""} ${forn.specsTecnicas || ""} ${forn.praca || ""}`.toLowerCase();
      const matchBusca = !busca || textoBusca.includes(busca.toLowerCase());

      return matchCat && matchBusca;
    });
  }, [fornecedores, categoriaAtiva, busca]);

  return (
    <div className="space-y-6">
      
      {/* BARRA DE FILTROS POR CATEGORIA SOLICITADA */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* BUSCADOR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar parceiro por nome, representante, contato ou formato..."
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-950 placeholder-slate-500 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs font-black text-slate-900 bg-slate-100 px-3.5 py-2 rounded-2xl border-2 border-slate-300 text-center sm:text-right shrink-0">
            <span>{fornecedoresFiltrados.length}</span> parceiros encontrados
          </div>
        </div>

        {/* ABAS SEPARADORAS DAS MÍDIAS (OUTDOOR, RÁDIO, LED/INDOOR, TV, ETC.) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {categoriasMeta.map((cat) => {
            const Icon = cat.icon;
            const isSelected = categoriaAtiva === cat.id;
            const count = contagens[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id as CategoriaFiltro)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all border-2 cursor-pointer ${
                  isSelected
                    ? `${cat.color} border-transparent shadow-md scale-[1.02]`
                    : "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-200 hover:text-slate-950"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-900"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* GRADE PRINCIPAL DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fornecedoresFiltrados.map((forn) => {
          const totalItens = (forn.pontosFisicos?.length || 0) + (forn.midias?.length || 0);
          const cat = categorizarFornecedor(forn);

          let badgeStyle = "bg-blue-100 text-blue-900 border-blue-300";
          if (cat === "OUTDOOR") badgeStyle = "bg-amber-100 text-amber-950 border-amber-300";
          if (cat === "RADIO") badgeStyle = "bg-blue-100 text-blue-950 border-blue-300";
          if (cat === "LED_INDOOR") badgeStyle = "bg-indigo-100 text-indigo-950 border-indigo-300";
          if (cat === "TV") badgeStyle = "bg-rose-100 text-rose-950 border-rose-300";
          if (cat === "DIGITAL") badgeStyle = "bg-sky-100 text-sky-950 border-sky-300";
          if (cat === "PRODUTORAS") badgeStyle = "bg-purple-100 text-purple-950 border-purple-300";
          if (cat === "GRAFICAS") badgeStyle = "bg-teal-100 text-teal-950 border-teal-300";

          return (
            <div
              key={forn.id}
              onClick={() => setFornecedorSelecionado(forn)}
              className="bg-white border-2 border-slate-300 rounded-3xl p-6 space-y-4 flex flex-col justify-between cursor-pointer group hover:border-blue-600 hover:shadow-lg transition-all shadow-sm relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${badgeStyle}`}>
                      {forn.tipoVeiculo || "Mídia"}
                    </span>
                    <h3 className="font-display font-extrabold text-slate-950 text-base mt-2.5 leading-snug group-hover:text-blue-700 transition-colors">
                      {forn.nome}
                    </h3>
                    <div className="text-xs text-slate-700 font-bold mt-0.5">{forn.praca || "Feira de Santana"}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-600 uppercase font-black">Itens Ativos</div>
                    <div className="text-sm font-black text-slate-950">
                      {totalItens} item(ns)
                    </div>
                  </div>
                </div>

                {/* SPECS TÉCNICAS */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-1">
                  <div className="text-[11px] text-slate-700 uppercase font-black flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-blue-700" />
                    <span>Especificações Técnicas:</span>
                  </div>
                  <div className="text-xs text-slate-900 font-bold line-clamp-2">
                    {forn.specsTecnicas || "Formatos homologados pelo Grupo Nobre"}
                  </div>
                </div>

                {/* CONTATO DO REPRESENTANTE */}
                <div className="mt-3.5 text-xs text-slate-800 space-y-1 font-semibold">
                  <div className="font-extrabold text-slate-950 flex items-center gap-1">
                    <span>Representante:</span>
                    <span className="text-blue-900">{forn.contatoNome || "Atendimento Comercial"}</span>
                  </div>
                  {forn.email && (
                    <div className="text-slate-700 flex items-center gap-1.5 text-xs">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{forn.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTÃO E AÇÃO DE EXPANDIR ITENS */}
              <div className="pt-3.5 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-black text-blue-700 group-hover:text-blue-900 flex items-center gap-1">
                  Ver itens ({totalItens}) <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>

                {forn.whatsapp && (
                  <a
                    href={`https://wa.me/55${forn.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* DRAWER / MODAL COM TODOS OS ITENS E PONTOS DO FORNECEDOR */}
      {fornecedorSelecionado && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            
            {/* TOPO DO MODAL */}
            <div className="flex items-start justify-between pb-5 border-b-2 border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 border border-blue-300">
                    {fornecedorSelecionado.tipoVeiculo}
                  </span>
                  <span className="text-xs text-slate-700 font-extrabold">
                    {fornecedorSelecionado.praca}
                  </span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-slate-950">
                  {fornecedorSelecionado.nome}
                </h2>
                <p className="text-xs text-slate-700 font-semibold">
                  Catálogo de pontos físicos, veiculações ativas e especificações técnicas
                </p>
              </div>

              <div className="flex items-center gap-2">
                {fornecedorSelecionado.whatsapp && (
                  <a
                    href={`https://wa.me/55${fornecedorSelecionado.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setFornecedorSelecionado(null)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* SPECS & CONTATOS RESUMO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-600 uppercase font-black">Contato Comercial</span>
                <div className="font-extrabold text-slate-950 mt-0.5">{fornecedorSelecionado.contatoNome || "Atendimento"}</div>
                {fornecedorSelecionado.email && <div className="text-xs text-slate-700 font-bold mt-0.5">{fornecedorSelecionado.email}</div>}
              </div>

              <div>
                <span className="text-[10px] text-slate-600 uppercase font-black">Prazo de Envio de Arte</span>
                <div className="font-extrabold text-slate-950 mt-0.5">{fornecedorSelecionado.prazoEntregaDias || 2} dias úteis</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-600 uppercase font-black">Especificação Técnica</span>
                <div className="text-slate-900 font-bold mt-0.5 text-xs">{fornecedorSelecionado.specsTecnicas || "Padrão"}</div>
              </div>
            </div>

            {/* INVENTÁRIO UNIFICADO DE ESPAÇOS & VEICULAÇÕES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-display font-black text-base text-slate-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    Espaços, Formatos & Veiculações Ativas
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Consulte cada espaço do parceiro, dimensões e qual campanha está em exibição
                  </p>
                </div>
                <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-xl border border-slate-300">
                  {Math.max(
                    (fornecedorSelecionado.pontosFisicos?.length || 0),
                    (fornecedorSelecionado.midias?.length || 0),
                    1
                  )}{" "}
                  espaço(s)
                </span>
              </div>

              {/* LISTAGEM UNIFICADA EM CARDS RICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. SE O PARCEIRO TEM PONTOS FÍSICOS (OUTDOORS, ACADEMIAS, LEDS) */}
                {fornecedorSelecionado.pontosFisicos && fornecedorSelecionado.pontosFisicos.length > 0 ? (
                  fornecedorSelecionado.pontosFisicos.map((ponto: any) => {
                    const midiaAtiva = ponto.midias && ponto.midias.length > 0 ? ponto.midias[0] : null;

                    return (
                      <div
                        key={ponto.id}
                        className="p-4 rounded-2xl bg-white border-2 border-slate-300 space-y-3 flex flex-col justify-between shadow-sm hover:border-blue-500 transition-all"
                      >
                        <div>
                          {ponto.fotoLocalUrl && (
                            <div className="h-36 -mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden relative border-b-2 border-slate-300 bg-slate-100">
                              <img src={ponto.fotoLocalUrl} alt="" className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2">
                                <StatusBadge status={ponto.statusPonto} />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                            <span className="text-blue-700 font-black">{ponto.codigoIdentificador || "ESPAÇO"}</span>
                            <span>{ponto.bairro}</span>
                          </div>

                          <h4 className="font-display font-extrabold text-base text-slate-950 mt-1 leading-snug">
                            {ponto.nomeLocal}
                          </h4>

                          <div className="text-xs text-slate-800 font-bold mt-0.5">
                            📐 {ponto.tipoFormato}
                          </div>

                          <p className="text-xs text-slate-600 font-medium mt-1">
                            📍 {ponto.endereco}
                          </p>
                        </div>

                        {/* BLOCO DA CAMPANHA DIRETO NO CARD DO ESPAÇO */}
                        {midiaAtiva ? (
                          <div className="p-3 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <BrandBadge marcaId={midiaAtiva.marcaId} />
                              <span className="text-xs font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                                {midiaAtiva.biSemana || "Ativa"}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-black text-slate-950 truncate">
                                {midiaAtiva.campanha?.nome || "Campanha em Exibição"}
                              </div>
                              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                Vigência: {formatarData(midiaAtiva.dataInicio)} a {formatarData(midiaAtiva.dataFim)}
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                              <span className="text-[11px] font-bold text-slate-700">Ação: {midiaAtiva.tipoAcaoFinal || "Renovação"}</span>
                              <CountdownBadge dataFim={midiaAtiva.dataFim} tipoAcaoFinal={midiaAtiva.tipoAcaoFinal} />
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 text-center text-xs text-emerald-950 font-black">
                            🟢 Espaço Livre para Novas Campanhas
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : fornecedorSelecionado.midias && fornecedorSelecionado.midias.length > 0 ? (
                  /* 2. SE FOR VEÍCULO SEM PONTO FÍSICO (RÁDIO, TV, DIGITAL, PRODUTORAS) */
                  fornecedorSelecionado.midias.map((midia: any) => (
                    <div
                      key={midia.id}
                      className="p-4 rounded-2xl bg-white border-2 border-slate-300 space-y-3 flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <BrandBadge marcaId={midia.marcaId} />
                          <StatusBadge status={midia.statusVeiculacao} />
                        </div>

                        <h4 className="font-display font-extrabold text-base text-slate-950 leading-snug">
                          {midia.campanha?.nome || "Campanha"}
                        </h4>

                        <div className="text-xs text-slate-800 font-bold">
                          📺 Formato: {midia.formatoPeca} • {midia.biSemana || "Veiculação Contínua"}
                        </div>

                        <div className="text-xs text-slate-600 font-medium">
                          Período: {formatarData(midia.dataInicio)} a {formatarData(midia.dataFim)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Ação: {midia.tipoAcaoFinal || "Renovação"}</span>
                        <CountdownBadge dataFim={midia.dataFim} tipoAcaoFinal={midia.tipoAcaoFinal} />
                      </div>
                    </div>
                  ))
                ) : (
                  /* 3. SE NÃO HOUVER VEICULAÇÃO ATIVA NEM PONTO CADASTRADO */
                  <div className="col-span-full p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-1.5">
                    <div className="text-sm font-black text-slate-900">
                      Nenhum contrato ativo no momento
                    </div>
                    <p className="text-xs text-slate-600">
                      Este parceiro está homologado no catálogo geral e disponível para novas contratações da holding.
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
