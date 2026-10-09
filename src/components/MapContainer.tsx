"use client";

import { useEffect, useRef, useState } from "react";
import { formatarData } from "@/lib/utils";
import { MapPin, Phone, Sun, Moon, Satellite, Compass } from "lucide-react";
import { NovoPontoModal } from "@/components/NovoPontoModal";

export function MapContainer({
  pontos,
  fornecedores = [],
  campanhas = [],
}: {
  pontos: any[];
  fornecedores?: any[];
  campanhas?: any[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [filtroMarca, setFiltroMarca] = useState("TODAS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [estiloMapa, setEstiloMapa] = useState<"claro" | "satelite" | "dark">("claro");

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

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

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
      }, 300);

      renderMarkers(L, map);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      aplicarCamadaMapa(L, mapInstanceRef.current, estiloMapa);
    });
  }, [estiloMapa]);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      renderMarkers(L, mapInstanceRef.current);
    });
  }, [filtroMarca, filtroStatus, pontos]);

  const aplicarCamadaMapa = (L: any, map: any, estilo: "dark" | "claro" | "satelite") => {
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
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const createPinIcon = (corHex: string, isComprado: boolean) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.4"/>
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
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });
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

      return matchMarca && matchStatus;
    });

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
        ? `<div style="height: 130px; margin: -14px -14px 10px -14px; border-radius: 12px 12px 0 0; overflow: hidden; position: relative;">
            <img src="${ponto.fotoLocalUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 6px; ${
              isComprado ? 'background: #059669; color: #fff;' : 'background: #2563eb; color: #fff;'
            }">${ponto.statusPonto}</span>
           </div>`
        : "";

      const campanhaHtml = midiaAtiva
        ? `<div style="background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px; border-radius: 12px; margin: 8px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; font-family: var(--font-saira, sans-serif); ${marcaBadgeStyle}">${marcaLabel}</span>
              <span style="font-size: 10px; color: #1E3A8A; font-family: var(--font-saira, sans-serif); font-weight: 800; background: #DBEAFE; padding: 2px 6px; border-radius: 4px;">${midiaAtiva.biSemana || "Ativa"}</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0F172A;">${midiaAtiva.campanha?.nome || "Campanha em Exibição"}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px; font-weight: 600;">Vigência: ${formatarData(midiaAtiva.dataInicio)} a ${formatarData(midiaAtiva.dataFim)}</div>
            <div style="font-size: 10px; font-weight: 800; color: #E11D48; margin-top: 4px;">🚨 Ação: ${midiaAtiva.tipoAcaoFinal || "Revisão"}</div>
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
        <div style="width: 290px; font-family: var(--font-saira, sans-serif); color: #0F172A; line-height: 1.35; padding: 2px;">
          ${fotoHtml}
          <div style="font-size: 10px; color: #1D4ED8; text-transform: uppercase; font-weight: 800;">${ponto.codigoIdentificador || 'PONTO'} • ${ponto.bairro}</div>
          <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-top: 2px;">${ponto.nomeLocal}</div>
          <div style="font-size: 11px; color: #475569; font-weight: 700; margin-top: 2px;">${ponto.tipoFormato}</div>
          <div style="font-size: 11px; color: #334155; margin-top: 2px;">📍 ${ponto.endereco}</div>
          
          ${campanhaHtml}

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #CBD5E1; margin-top: 8px; font-size: 11px;">
            <span style="color: #475569; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">${ponto.fornecedor?.nome || 'Fornecedor'}</span>
            ${whatsappBtn}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320 });
      markersRef.current.push(marker);
    });
  };

  return (
    <div className="space-y-4">
      
      {/* BARRA SUPERIOR DE FILTROS & SELETOR DE CAMADAS */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-300 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 animate-spin text-blue-700" style={{ animationDuration: "12s" }} />
            <span>Geolocalização Urbana</span>
          </div>
          <h2 className="font-display text-xl font-extrabold text-slate-900 mt-1">
            Mapa Territorial de Presença
          </h2>
          <p className="text-xs text-slate-600 font-semibold">
            100% Free: OpenStreetMap oficial (zero taxas e sem API Keys)
          </p>
        </div>

        {/* CONTROLES */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* SELETOR DE ESTILO DO MAPA */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 text-xs gap-1">
            <button
              onClick={() => setEstiloMapa("claro")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                estiloMapa === "claro"
                  ? "bg-white text-blue-700 border border-slate-300 shadow-sm"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Claro (OSM)
            </button>
            <button
              onClick={() => setEstiloMapa("satelite")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                estiloMapa === "satelite"
                  ? "bg-white text-blue-700 border border-slate-300 shadow-sm"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satélite
            </button>
            <button
              onClick={() => setEstiloMapa("dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                estiloMapa === "dark"
                  ? "bg-white text-blue-700 border border-slate-300 shadow-sm"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark OSM
            </button>
          </div>

          {/* FILTRO DE MARCAS */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 text-xs gap-1">
            <button
              onClick={() => setFiltroMarca("TODAS")}
              className={`px-3 py-1.5 text-xs rounded-xl font-extrabold transition-all ${
                filtroMarca === "TODAS"
                  ? "bg-slate-950 text-white shadow"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroMarca("UNEF")}
              className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all ${
                filtroMarca === "UNEF"
                  ? "bg-[#F59E13] text-black shadow ring-2 ring-amber-600"
                  : "bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200"
              }`}
            >
              UNEF
            </button>
            <button
              onClick={() => setFiltroMarca("UNIFAN")}
              className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all ${
                filtroMarca === "UNIFAN"
                  ? "bg-[#2563EB] text-white shadow ring-2 ring-blue-700"
                  : "bg-blue-100 text-blue-950 border border-blue-300 hover:bg-blue-200"
              }`}
            >
              UNIFAN
            </button>
            <button
              onClick={() => setFiltroMarca("NOBRE")}
              className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all ${
                filtroMarca === "NOBRE"
                  ? "bg-[#0284C7] text-white shadow ring-2 ring-sky-700"
                  : "bg-sky-100 text-sky-950 border border-sky-300 hover:bg-sky-200"
              }`}
            >
              Nobre
            </button>
            <button
              onClick={() => setFiltroMarca("MAPLE")}
              className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all ${
                filtroMarca === "MAPLE"
                  ? "bg-[#E11D48] text-white shadow ring-2 ring-rose-700"
                  : "bg-rose-100 text-rose-950 border border-rose-300 hover:bg-rose-200"
              }`}
            >
              Maple
            </button>
          </div>

          {/* STATUS COMPRADO VS LIVRE */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-white border-2 border-slate-300 text-xs font-bold text-slate-900 rounded-2xl px-3.5 py-2.5 outline-none focus:border-blue-600 shadow-sm"
          >
            <option value="TODOS">Todos os Pontos</option>
            <option value="COMPRADOS">Apenas Comprados / Ativos</option>
            <option value="DISPONIVEIS">Apenas Disponíveis / Livres</option>
          </select>

          {/* BOTÃO ADICIONAR NOVO PONTO */}
          <NovoPontoModal
            fornecedores={fornecedores}
            campanhas={campanhas}
          />

        </div>
      </div>

      {/* CONTAINER DO MAPA */}
      <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* LEGENDA */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white border-2 border-slate-300 shadow-sm text-xs text-slate-800">
        <div className="flex items-center gap-4 flex-wrap font-bold">
          <span className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider">
            Legenda de Pins:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F59E13] border border-black/20" />
            <span className="text-amber-950 font-black text-xs">UNEF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB]" />
            <span className="text-blue-950 font-black text-xs">UNIFAN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7]" />
            <span className="text-sky-950 font-black text-xs">Colégio Nobre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E11D48]" />
            <span className="text-rose-950 font-black text-xs">Maple Bear</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-400 border border-dashed border-slate-700" />
            <span className="text-slate-700 font-bold text-xs">Ponto Livre / Disponível</span>
          </div>
        </div>

        <div className="text-xs text-emerald-800 font-extrabold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          ✓ 100% Free: OpenStreetMap oficial
        </div>
      </div>

    </div>
  );
}
