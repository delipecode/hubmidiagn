"use client";

import { useEffect, useRef, useState } from "react";
import { BrandBadge, StatusBadge, CountdownBadge, MediaCategoryBadge } from "@/components/BrandBadge";
import { formatarData } from "@/lib/utils";
import { NovoPontoModal } from "@/components/NovoPontoModal";
import {
  MapPin,
  List,
  Camera,
  Search,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Satellite,
  Compass,
  ArrowRight,
  Filter,
} from "lucide-react";

interface CentralTerritorialProps {
  pontos: any[];
  checkings: any[];
  fornecedores: any[];
  campanhas: any[];
}

export function CentralTerritorial({
  pontos,
  checkings,
  fornecedores,
  campanhas,
}: CentralTerritorialProps) {
  const [modoVisualizacao, setModoVisualizacao] = useState<"mapa" | "inventario" | "checking">("mapa");
  const [filtroMarca, setFiltroMarca] = useState("TODAS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroTipoMidia, setFiltroTipoMidia] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [pontoAtivoId, setPontoAtivoId] = useState<string | null>(null);
  const [estiloMapa, setEstiloMapa] = useState<"claro" | "satelite" | "dark">("claro");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const camadas = {
    claro: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      isDarkFilter: false,
    },
    satelite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri",
      maxZoom: 18,
      isDarkFilter: false,
    },
    dark: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      isDarkFilter: true,
    },
  };

  const pontosFiltrados = pontos.filter((p) => {
    const midiaAtiva = p.midias && p.midias.length > 0 ? p.midias[0] : null;
    const marcaPonto = midiaAtiva ? midiaAtiva.marcaId : null;

    const matchMarca =
      filtroMarca === "TODAS" ||
      (filtroMarca === "DISPONIVEIS" && !midiaAtiva) ||
      marcaPonto === filtroMarca;

    const matchStatus =
      filtroStatus === "TODOS" ||
      (filtroStatus === "COMPRADOS" && p.statusPonto === "Comprado / Ativo") ||
      (filtroStatus === "DISPONIVEIS" && p.statusPonto === "Disponível / Mapeado");

    // Filtro por Tipo de Mídia
    let matchTipo = true;
    if (filtroTipoMidia !== "TODOS") {
      const formato = (p.tipoFormato || "").toLowerCase();
      const nome = (p.nomeLocal || "").toLowerCase();
      const forn = (p.fornecedor?.nome || "").toLowerCase();
      const subtipo = midiaAtiva ? (midiaAtiva.subtipoMidia || "").toLowerCase() : "";

      if (filtroTipoMidia === "OUTDOOR") {
        matchTipo = formato.includes("outdoor") || formato.includes("lona") || subtipo.includes("outdoor");
      } else if (filtroTipoMidia === "INDOOR_TELAS") {
        matchTipo = formato.includes("tela") || forn.includes("henkley") || subtipo.includes("telas");
      } else if (filtroTipoMidia === "LED") {
        matchTipo = formato.includes("led") || forn.includes("girlan") || subtipo.includes("led");
      } else if (filtroTipoMidia === "ACADEMIA") {
        matchTipo = formato.includes("academia") || formato.includes("adesivo") || formato.includes("espelho") || forn.includes("biohit") || forn.includes("feira fit") || subtipo.includes("academia");
      }
    }

    const textoBusca = `${p.nomeLocal} ${p.bairro} ${p.endereco} ${p.codigoIdentificador} ${p.fornecedor?.nome || ""} ${midiaAtiva?.campanha?.nome || ""}`.toLowerCase();
    const matchBusca = !busca || textoBusca.includes(busca.toLowerCase());

    return matchMarca && matchStatus && matchTipo && matchBusca;
  });

  const checkingsFiltrados = checkings.filter((chk) => {
    const marcaId = chk.midiaCampanha?.marcaId;
    const matchMarca = filtroMarca === "TODAS" || marcaId === filtroMarca;
    const textoBusca = `${chk.pontoFisico?.nomeLocal} ${chk.pontoFisico?.bairro} ${chk.midiaCampanha?.campanha?.nome || ""}`.toLowerCase();
    const matchBusca = !busca || textoBusca.includes(busca.toLowerCase());
    return matchMarca && matchBusca;
  });

  useEffect(() => {
    if (modoVisualizacao !== "mapa" || typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [-12.2575, -38.9667],
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      aplicarCamadaMapa(L, map, estiloMapa);

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);

      renderMarkers(L, map);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [modoVisualizacao]);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined" || modoVisualizacao !== "mapa") return;

    import("leaflet").then((L) => {
      aplicarCamadaMapa(L, mapInstanceRef.current, estiloMapa);
    });
  }, [estiloMapa]);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined" || modoVisualizacao !== "mapa") return;

    import("leaflet").then((L) => {
      renderMarkers(L, mapInstanceRef.current);
    });
  }, [pontosFiltrados, modoVisualizacao]);

  const aplicarCamadaMapa = (L: any, map: any, estilo: "claro" | "satelite" | "dark") => {
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = camadas[estilo];
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      className: config.isDarkFilter ? "leaflet-tile-dark" : "",
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;
  };

  const renderMarkers = (L: any, map: any) => {
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    const createPinIcon = (corHex: string, isComprado: boolean) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.4"/>
            </filter>
          </defs>
          <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 16 1-3 8-10.75 8-16 0-4.42-3.58-8-8-8z" 
                fill="${corHex}" 
                stroke="${isComprado ? '#ffffff' : '#1e293b'}" 
                stroke-width="${isComprado ? '2.5' : '1.5'}"
                stroke-dasharray="${isComprado ? 'none' : '2,2'}"
                filter="url(#shadow)"/>
          <circle cx="12" cy="8" r="3.5" fill="#ffffff" />
        </svg>
      `;
      return L.divIcon({
        html: svg,
        className: "custom-leaflet-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
    };

    pontosFiltrados.forEach((ponto) => {
      const midiaAtiva = ponto.midias && ponto.midias.length > 0 ? ponto.midias[0] : null;
      const isComprado = ponto.statusPonto === "Comprado / Ativo" && Boolean(midiaAtiva);

      let corPin = "#2563EB";
      let marcaLabel = "Ponto Livre";
      let marcaBadgeStyle = "background: #F1F5F9; color: #0F172A; border: 1px solid #CBD5E1;";

      if (midiaAtiva) {
        if (midiaAtiva.marcaId === "UNEF") {
          corPin = "#F59E13";
          marcaLabel = "UNEF";
          marcaBadgeStyle = "background: #F59E13; color: #000000; font-weight: 800;";
        } else if (midiaAtiva.marcaId === "UNIFAN") {
          corPin = "#2563EB";
          marcaLabel = "UNIFAN";
          marcaBadgeStyle = "background: #2563EB; color: #ffffff; font-weight: 800;";
        } else if (midiaAtiva.marcaId === "NOBRE") {
          corPin = "#0284C7";
          marcaLabel = "Colégio Nobre";
          marcaBadgeStyle = "background: #0284C7; color: #ffffff; font-weight: 800;";
        } else if (midiaAtiva.marcaId === "MAPLE") {
          corPin = "#E11D48";
          marcaLabel = "Maple Bear";
          marcaBadgeStyle = "background: #E11D48; color: #ffffff; font-weight: 800;";
        }
      }

      const icon = createPinIcon(corPin, isComprado);
      const marker = L.marker([ponto.latitude, ponto.longitude], { icon }).addTo(map);

      const fotoHtml = ponto.fotoLocalUrl
        ? `<div style="height: 120px; margin: -14px -14px 10px -14px; border-radius: 12px 12px 0 0; overflow: hidden; position: relative;">
            <img src="${ponto.fotoLocalUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; ${
              isComprado ? 'background: #059669; color: #fff;' : 'background: #2563eb; color: #fff;'
            }">${ponto.statusPonto}</span>
           </div>`
        : "";

      const campanhaHtml = midiaAtiva
        ? `<div style="background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px; border-radius: 12px; margin: 8px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-family: var(--font-saira, sans-serif); ${marcaBadgeStyle}">${marcaLabel}</span>
              <span style="font-size: 10px; color: #1e3a8a; font-family: var(--font-saira, sans-serif); font-weight: 800; background: #DBEAFE; padding: 2px 6px; border-radius: 4px;">${midiaAtiva.biSemana || "Ativa"}</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0F172A;">${midiaAtiva.campanha?.nome || "Campanha em Exibição"}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px; font-weight: 600;">Vigência: ${formatarData(midiaAtiva.dataInicio)} a ${formatarData(midiaAtiva.dataFim)}</div>
            <div style="font-size: 11px; font-weight: 800; color: #E11D48; margin-top: 4px;">🚨 Ação: ${midiaAtiva.tipoAcaoFinal || "Revisão"}</div>
           </div>`
        : `<div style="background: #F0FDF4; border: 1px dashed #86EFAC; padding: 10px; border-radius: 12px; text-align: center; margin: 8px 0; font-size: 11px; color: #166534; font-weight: bold;">
            🟢 Ponto Livre para Reserva / Negociação
           </div>`;

      const whatsappBtn = ponto.fornecedor?.whatsapp
        ? `<a href="https://wa.me/55${ponto.fornecedor.whatsapp}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; color: #fff; background: #059669; padding: 5px 10px; border-radius: 8px; text-decoration: none;">
            WhatsApp
           </a>`
        : "";

      const popupContent = `
        <div style="width: 280px; font-family: var(--font-saira, sans-serif); color: #0F172A; line-height: 1.35; padding: 2px;">
          ${fotoHtml}
          <div style="font-size: 10px; color: #1D4ED8; text-transform: uppercase; font-weight: 800;">${ponto.codigoIdentificador || 'PONTO'} • ${ponto.bairro}</div>
          <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-top: 2px;">${ponto.nomeLocal}</div>
          <div style="font-size: 11px; color: #475569; font-weight: 700; margin-top: 2px;">${ponto.tipoFormato}</div>
          <div style="font-size: 11px; color: #334155; margin-top: 2px;">📍 ${ponto.endereco}</div>
          ${campanhaHtml}
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #CBD5E1; margin-top: 8px; font-size: 11px;">
            <span style="color: #475569; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;">${ponto.fornecedor?.nome || 'Fornecedor'}</span>
            ${whatsappBtn}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      markersRef.current[ponto.id] = marker;

      marker.on("click", () => {
        setPontoAtivoId(ponto.id);
      });
    });
  };

  const focarPontoNoMapa = (ponto: any) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([ponto.latitude, ponto.longitude], 15, { duration: 1 });
    setPontoAtivoId(ponto.id);
    const marker = markersRef.current[ponto.id];
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DO MAPA DE MÍDIA */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-300">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-blue-700 animate-spin" style={{ animationDuration: "14s" }} />
            <span>Mapa de Mídia • Grupo Nobre</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mapa de Mídia & Central Territorial
          </h1>
          <p className="text-sm text-slate-700 font-semibold">
            Painel unificado: visualize os pontos no mapa interativo, consulte o inventário técnico e audite as fotos de comprovação de rua
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SELETOR DE MODOS / ABAS */}
          <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-300 shadow-sm">
            <button
              onClick={() => setModoVisualizacao("mapa")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                modoVisualizacao === "mapa"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-700 hover:bg-slate-100"
              }`}
            >
              <MapPin className="w-4 h-4" /> Mapa & Split
            </button>
            <button
              onClick={() => setModoVisualizacao("inventario")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                modoVisualizacao === "inventario"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-700 hover:bg-slate-100"
              }`}
            >
              <List className="w-4 h-4" /> Inventário ({pontosFiltrados.length})
            </button>
            <button
              onClick={() => setModoVisualizacao("checking")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                modoVisualizacao === "checking"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-700 hover:bg-slate-100"
              }`}
            >
              <Camera className="w-4 h-4" /> Checking ({checkingsFiltrados.length})
            </button>
          </div>

          <NovoPontoModal fornecedores={fornecedores} campanhas={campanhas} />
        </div>
      </div>

      {/* BARRA DE FILTROS GLOBAIS UNIFICADOS - 100% ALTO CONTRASTE */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        
        {/* BUSCA EM TEMPO REAL */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por local, bairro, placa ou parceiro..."
            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold"
          />
        </div>

        {/* FILTROS DE MARCA E STATUS COM CAIXAS COLORIDAS */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* MARCAS */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 text-xs gap-1">
            <button
              onClick={() => setFiltroMarca("TODAS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                filtroMarca === "TODAS"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroMarca("UNEF")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filtroMarca === "UNEF"
                  ? "bg-[#F59E13] text-slate-950 shadow-sm ring-2 ring-amber-600"
                  : "text-amber-900 bg-amber-100/90 hover:bg-amber-200"
              }`}
            >
              UNEF
            </button>
            <button
              onClick={() => setFiltroMarca("UNIFAN")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filtroMarca === "UNIFAN"
                  ? "bg-[#2563EB] text-white shadow-sm ring-2 ring-blue-700"
                  : "text-blue-900 bg-blue-100/90 hover:bg-blue-200"
              }`}
            >
              UNIFAN
            </button>
            <button
              onClick={() => setFiltroMarca("NOBRE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filtroMarca === "NOBRE"
                  ? "bg-[#0284C7] text-white shadow-sm ring-2 ring-sky-700"
                  : "text-sky-900 bg-sky-100/90 hover:bg-sky-200"
              }`}
            >
              Nobre
            </button>
            <button
              onClick={() => setFiltroMarca("MAPLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filtroMarca === "MAPLE"
                  ? "bg-[#E11D48] text-white shadow-sm ring-2 ring-rose-700"
                  : "text-rose-900 bg-rose-100/90 hover:bg-rose-200"
              }`}
            >
              Maple
            </button>
          </div>

          {/* TIPO DE MÍDIA */}
          <select
            value={filtroTipoMidia}
            onChange={(e) => setFiltroTipoMidia(e.target.value)}
            className="bg-white border-2 border-slate-300 text-xs font-bold text-slate-900 rounded-2xl px-3.5 py-2.5 outline-none focus:border-blue-600 shadow-sm"
          >
            <option value="TODOS">Todas as Mídias</option>
            <option value="OUTDOOR">🏢 Outdoors & OOH</option>
            <option value="INDOOR_TELAS">🖥️ TV Indoor / Telas</option>
            <option value="LED">💡 Painéis de LED</option>
            <option value="ACADEMIA">🏋️ Adesivos / Academias</option>
          </select>

          {/* STATUS */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-white border-2 border-slate-300 text-xs font-bold text-slate-900 rounded-2xl px-3.5 py-2.5 outline-none focus:border-blue-600 shadow-sm"
          >
            <option value="TODOS">Todos os Pontos</option>
            <option value="COMPRADOS">Apenas Comprados / Ativos</option>
            <option value="DISPONIVEIS">Apenas Livres / Disponíveis</option>
          </select>

          {/* SELETOR DE CAMADA DE MAPA */}
          {modoVisualizacao === "mapa" && (
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 text-xs gap-1">
              <button
                onClick={() => setEstiloMapa("claro")}
                className={`p-1.5 rounded-xl transition-all ${
                  estiloMapa === "claro" ? "bg-white text-blue-700 shadow-sm border border-slate-300" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Claro OSM"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEstiloMapa("satelite")}
                className={`p-1.5 rounded-xl transition-all ${
                  estiloMapa === "satelite" ? "bg-white text-blue-700 shadow-sm border border-slate-300" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Satélite Esri"
              >
                <Satellite className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEstiloMapa("dark")}
                className={`p-1.5 rounded-xl transition-all ${
                  estiloMapa === "dark" ? "bg-white text-blue-700 shadow-sm border border-slate-300" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Dark OSM"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* CONTEÚDO PRINCIPAL BASEADO NA ABA ATIVA */}

      {/* 🗺️ ABA 1: MAPA & SPLIT VIEW */}
      {modoVisualizacao === "mapa" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* MAPA PRINCIPAL (SPAN 8) */}
          <div className="lg:col-span-8 h-[680px] rounded-3xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100 relative">
            <div ref={mapContainerRef} className="w-full h-full" />
            
            {/* LEGENDA FLUTUANTE DISCRETA */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-slate-300 shadow-xl flex items-center justify-between gap-3 text-xs z-[1000]">
              <div className="flex items-center gap-3.5 flex-wrap">
                <span className="font-extrabold text-slate-900 uppercase text-[11px]">Pins:</span>
                <span className="flex items-center gap-1.5 text-xs text-amber-950 font-black">
                  <span className="w-3 h-3 rounded-full bg-[#F59E13] border border-black/20" /> UNEF
                </span>
                <span className="flex items-center gap-1.5 text-xs text-blue-950 font-black">
                  <span className="w-3 h-3 rounded-full bg-[#2563EB]" /> UNIFAN
                </span>
                <span className="flex items-center gap-1.5 text-xs text-sky-950 font-black">
                  <span className="w-3 h-3 rounded-full bg-[#0284C7]" /> Nobre
                </span>
                <span className="flex items-center gap-1.5 text-xs text-rose-950 font-black">
                  <span className="w-3 h-3 rounded-full bg-[#E11D48]" /> Maple
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                  <span className="w-3 h-3 rounded-full bg-slate-400 border border-dashed border-slate-700" /> Livre
                </span>
              </div>
              <span className="text-xs text-emerald-800 font-extrabold hidden sm:inline">
                ✓ 100% Free OpenStreetMap
              </span>
            </div>
          </div>

          {/* COLUNA LATERAL DE CARDS SINCRONIZADOS (SPAN 4) */}
          <div className="lg:col-span-4 h-[680px] overflow-y-auto space-y-3.5 pr-1">
            <div className="text-xs font-black text-slate-900 uppercase tracking-wider px-1">
              Pontos Mapeados ({pontosFiltrados.length})
            </div>

            {pontosFiltrados.map((ponto) => {
              const midiaAtiva = ponto.midias && ponto.midias.length > 0 ? ponto.midias[0] : null;
              const isSelected = pontoAtivoId === ponto.id;

              return (
                <div
                  key={ponto.id}
                  onClick={() => focarPontoNoMapa(ponto)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? "bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500 scale-[1.01]"
                      : "bg-white hover:bg-slate-50 border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                      {ponto.codigoIdentificador || "PONTO"}
                    </span>
                    <StatusBadge status={ponto.statusPonto} />
                  </div>

                  <div>
                    <h4 className="font-display font-extrabold text-base leading-snug text-slate-950">
                      {ponto.nomeLocal}
                    </h4>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      📍 {ponto.endereco} ({ponto.bairro})
                    </p>
                  </div>

                  {midiaAtiva ? (
                    <div className={`p-3 rounded-xl border-2 space-y-1.5 ${
                      isSelected ? "bg-white border-blue-300 shadow-sm" : "bg-slate-50 border-slate-300"
                    }`}>
                      <div className="flex items-center justify-between">
                        <BrandBadge marcaId={midiaAtiva.marcaId} />
                        <span className="text-xs font-black text-blue-950 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
                          {midiaAtiva.biSemana}
                        </span>
                      </div>
                      <div className="text-xs font-black text-slate-950 truncate">
                        {midiaAtiva.campanha?.nome}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-950 font-black bg-emerald-50 px-2.5 py-1.5 rounded-lg border-2 border-emerald-300">
                      🟢 Ponto Disponível para Reserva
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-xs text-slate-800 truncate max-w-[140px] font-bold">
                      {ponto.fornecedor?.nome}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        focarPontoNoMapa(ponto);
                      }}
                      className="text-xs font-extrabold flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition-all"
                    >
                      <span>Focar no Mapa</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 📋 ABA 2: INVENTÁRIO TÉCNICO COMPLETO */}
      {modoVisualizacao === "inventario" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pontosFiltrados.map((ponto) => {
            const midiaAtiva = ponto.midias && ponto.midias.length > 0 ? ponto.midias[0] : null;

            return (
              <div
                key={ponto.id}
                className="bg-white border-2 border-slate-300 rounded-3xl p-6 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  {ponto.fotoLocalUrl && (
                    <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden relative border-b-2 border-slate-300 bg-slate-100">
                      <img src={ponto.fotoLocalUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={ponto.statusPonto} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                      <span className="text-blue-700 font-extrabold">{ponto.codigoIdentificador || "PONTO"}</span>
                      <span>{ponto.bairro}</span>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-slate-900 leading-snug">
                      {ponto.nomeLocal}
                    </h3>

                    <div className="text-xs font-bold text-slate-700">
                      {ponto.tipoFormato}
                    </div>

                    <p className="text-xs text-slate-600 font-semibold">
                      📍 {ponto.endereco}
                    </p>
                  </div>

                  {midiaAtiva ? (
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <BrandBadge marcaId={midiaAtiva.marcaId} />
                        <span className="text-xs text-blue-900 font-extrabold bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                          {midiaAtiva.biSemana || "Ativa"}
                        </span>
                      </div>

                      <div className="font-display text-xs font-bold text-slate-900">
                        {midiaAtiva.campanha?.nome}
                      </div>

                      <div className="pt-1">
                        <CountdownBadge dataFim={midiaAtiva.dataFim} tipoAcaoFinal={midiaAtiva.tipoAcaoFinal} />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-300 text-center text-xs text-emerald-800 font-extrabold">
                      🟢 Disponível para novas campanhas
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 truncate max-w-[150px]">
                    <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
                    <span className="truncate text-xs font-bold">{ponto.fornecedor?.nome}</span>
                  </div>

                  {ponto.fornecedor?.whatsapp && (
                    <a
                      href={`https://wa.me/55${ponto.fornecedor.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 📸 ABA 3: MURAL DE CHECKING FOTOGRÁFICO */}
      {modoVisualizacao === "checking" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checkingsFiltrados.map((chk) => (
            <div
              key={chk.id}
              className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between group relative transition-shadow"
            >
              <div>
                <div className="h-56 bg-slate-100 relative overflow-hidden border-b-2 border-slate-300">
                  <img
                    src={chk.fotoCheckingUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={chk.status} />
                  </div>
                  {chk.midiaCampanha?.marcaId && (
                    <div className="absolute top-3 right-3">
                      <BrandBadge marcaId={chk.midiaCampanha.marcaId} />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span>Checado em: {formatarData(chk.dataChecagem)}</span>
                  </div>

                  <h3 className="font-display font-extrabold text-slate-900 text-base leading-snug">
                    {chk.pontoFisico?.nomeLocal}
                  </h3>

                  <div className="text-xs text-blue-700 font-extrabold">
                    {chk.midiaCampanha?.campanha?.nome || "Campanha em Exibição"}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {chk.observacoes || "Sem observações adicionais."}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold text-xs">
                    {chk.pontoFisico?.bairro}
                  </span>
                  <span className="text-emerald-900 font-extrabold flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Checking Aprovado
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
