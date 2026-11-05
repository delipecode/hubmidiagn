"use client";

import { useState, useRef } from "react";
import { criarPontoFisicoComMidia } from "@/lib/actions";
import {
  Plus,
  X,
  MapPin,
  Building2,
  Layers,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
} from "lucide-react";

function comprimirImagemNovoPonto(file: File, maxWidth = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Erro no canvas"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface NovoPontoModalProps {
  fornecedores: any[];
  campanhas: any[];
  fornecedorPadraoId?: string;
  labelBotao?: string;
  onSucesso?: () => void;
}

export function NovoPontoModal({
  fornecedores,
  campanhas,
  fornecedorPadraoId,
  labelBotao,
  onSucesso,
}: NovoPontoModalProps) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do Formulário
  const [fornecedorId, setFornecedorId] = useState(
    fornecedorPadraoId || fornecedores[0]?.id || ""
  );
  const [codigoIdentificador, setCodigoIdentificador] = useState("");
  const [nomeLocal, setNomeLocal] = useState("");
  const [tipoFormato, setTipoFormato] = useState("Outdoor Lona 9x3m");
  const [praca, setPraca] = useState("Feira de Santana");
  const [bairro, setBairro] = useState("Santa Mônica");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState("-12.2512");
  const [longitude, setLongitude] = useState("-38.9554");
  const [fotoLocalUrl, setFotoLocalUrl] = useState("");
  const [statusPonto, setStatusPonto] = useState("Disponível / Mapeado");

  // Vínculo com Campanha
  const [vincularCampanha, setVincularCampanha] = useState(false);
  const [campanhaId, setCampanhaId] = useState(campanhas[0]?.id || "");
  const [marcaId, setMarcaId] = useState("UNEF");
  const [biSemana, setBiSemana] = useState("BS 21 (06/10 a 19/10)");
  const [dataContrato, setDataContrato] = useState("2026-10-06");
  const [dataInicio, setDataInicio] = useState("2026-10-06");
  const [dataFim, setDataFim] = useState("2026-10-19");
  const [tipoAcaoFinal, setTipoAcaoFinal] = useState("Troca de Lona/Adesivo");
  const [numPI, setNumPI] = useState("");
  const [valorNegociado, setValorNegociado] = useState("");

  // Sugestões rápidas de coordenadas para bairros de Feira de Santana, Ipirá e Irecê
  const bairrosCoordenadas: Record<string, { lat: string; lng: string }> = {
    "Santa Mônica": { lat: "-12.2512", lng: "-38.9554" },
    Centro: { lat: "-12.2580", lng: "-38.9710" },
    Capuchinhos: { lat: "-12.2615", lng: "-38.9642" },
    "Fraga Maia": { lat: "-12.2390", lng: "-38.9605" },
    Sim: { lat: "-12.2685", lng: "-38.9320" },
    Kalilândia: { lat: "-12.2550", lng: "-38.9680" },
    Muchila: { lat: "-12.2710", lng: "-38.9750" },
    "Ipirá - Centro": { lat: "-12.1585", lng: "-39.7385" },
    "Ipirá - Entrada BA-052": { lat: "-12.1520", lng: "-39.7280" },
    "Irecê - Centro": { lat: "-11.3045", lng: "-41.8570" },
    "Irecê - Trevo BA-052": { lat: "-11.3120", lng: "-41.8480" },
  };

  const handlePracaChange = (novaPraca: string) => {
    setPraca(novaPraca);
    if (novaPraca === "Ipirá") {
      setBairro("Centro");
      setLatitude("-12.1585");
      setLongitude("-39.7380");
    } else if (novaPraca === "Irecê") {
      setBairro("Centro");
      setLatitude("-11.3045");
      setLongitude("-41.8570");
    } else if (novaPraca === "Feira de Santana") {
      setBairro("Santa Mônica");
      setLatitude("-12.2512");
      setLongitude("-38.9554");
    }
  };

  const handleBairroChange = (novoBairro: string) => {
    setBairro(novoBairro);
    if (bairrosCoordenadas[novoBairro]) {
      setLatitude(bairrosCoordenadas[novoBairro].lat);
      setLongitude(bairrosCoordenadas[novoBairro].lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      await criarPontoFisicoComMidia({
        fornecedorId,
        codigoIdentificador: codigoIdentificador || `PONTO-${Math.floor(Math.random() * 900 + 100)}`,
        nomeLocal,
        tipoFormato,
        praca,
        bairro,
        endereco,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        fotoLocalUrl:
          fotoLocalUrl ||
          "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
        statusPonto,
        vincularCampanha,
        campanhaId,
        marcaId,
        biSemana,
        dataContrato,
        dataInicio,
        dataFim,
        tipoAcaoFinal,
        numPI,
        valorNegociado: valorNegociado ? parseFloat(valorNegociado) : undefined,
      });

      setAberto(false);
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao salvar ponto:", err);
      alert("Erro ao cadastrar ponto. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (fornecedorPadraoId) setFornecedorId(fornecedorPadraoId);
          setAberto(true);
        }}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{labelBotao || "Novo Ponto (Outdoor / LED / Academia)"}</span>
      </button>

      {/* MODAL */}
      {aberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            
            {/* TOPO */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
                    Cadastrar Ponto Físico no Mapa
                  </h3>
                  <p className="text-xs text-slate-500">
                    Insira as coordenadas e vincule a um fornecedor e campanha
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

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* 1. DADOS DO PONTO */}
              <div className="space-y-3">
                <span className="font-bold text-blue-600 uppercase tracking-wider text-xs">
                  1. Localização & Especificações
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Fornecedor / Exibidora / Parceiro:
                    </label>
                    <select
                      value={fornecedorId}
                      onChange={(e) => setFornecedorId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    >
                      {fornecedores.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome} ({f.tipoVeiculo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Formato da Peça / Mídia:
                    </label>
                    <select
                      value={tipoFormato}
                      onChange={(e) => setTipoFormato(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Outdoor Lona 9x3m">Outdoor Lona 9x3m (Bi-Semana)</option>
                      <option value="Panfletagem / Ponto de Ação">Panfletagem / Ponto de Ação (Distribuição)</option>
                      <option value="Panfleto 10x15cm (Couché)">Panfleto 10x15cm (Couché 115g)</option>
                      <option value="Adesivo em Academia">Adesivo em Academia (Espelho/Catraca)</option>
                      <option value="Painel de LED">Painel de LED (Vídeo 10s)</option>
                      <option value="Busdoor">Busdoor (Traseira de Ônibus)</option>
                      <option value="Totem em Clínicas">Totem em Clínicas / Shoppings</option>
                      <option value="Frontlight">Frontlight Iluminado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nome do Local / Ponto de Referência:
                    </label>
                    <input
                      type="text"
                      value={nomeLocal}
                      onChange={(e) => setNomeLocal(e.target.value)}
                      placeholder="Ex: Av. Getúlio Vargas (Em frente ao Boulevard)"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Código / ID Placa:
                    </label>
                    <input
                      type="text"
                      value={codigoIdentificador}
                      onChange={(e) => setCodigoIdentificador(e.target.value)}
                      placeholder="Ex: OUT-GV-02"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Praça / Cidade:
                    </label>
                    <select
                      value={praca}
                      onChange={(e) => handlePracaChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                    >
                      <option value="Feira de Santana">Feira de Santana</option>
                      <option value="Ipirá">Ipirá</option>
                      <option value="Irecê">Irecê</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Bairro / Região:
                    </label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Ex: Centro, Entrada da Cidade..."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Endereço Completo / Referência:
                    </label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Ex: BA-052 Trevo de Acesso ou Av. Principal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* COORDENADAS GPS */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                      Latitude (GPS):
                    </label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                      Longitude (GPS):
                    </label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-semibold">
                      Foto do Ponto / Outdoor / Mídia:
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await comprimirImagemNovoPonto(file);
                          setFotoLocalUrl(dataUrl);
                        } catch {
                          alert("Erro ao processar imagem.");
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Enviar Foto do Dispositivo
                    </button>
                  </div>

                  {fotoLocalUrl && (
                    <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={fotoLocalUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoLocalUrl("")}
                        className="absolute top-2 right-2 px-2 py-1 rounded-md bg-slate-900/80 text-white text-[10px] font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={fotoLocalUrl.startsWith("data:") ? "" : fotoLocalUrl}
                    onChange={(e) => setFotoLocalUrl(e.target.value)}
                    disabled={fotoLocalUrl.startsWith("data:")}
                    placeholder={
                      fotoLocalUrl.startsWith("data:")
                        ? "Foto carregada do dispositivo"
                        : "Ou cole o link https://... da foto do outdoor/mídia"
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* 2. VINCULAR A CAMPANHA (OPCIONAL) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Vincular Imediatamente a uma Campanha?
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vincularCampanha}
                      onChange={(e) => setVincularCampanha(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {vincularCampanha && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Marca:
                        </label>
                        <select
                          value={marcaId}
                          onChange={(e) => setMarcaId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="UNEF">UNEF (Laranja)</option>
                          <option value="UNIFAN">UNIFAN (Azul Royal)</option>
                          <option value="UNIFAN_IPIRA">UNIFAN Ipirá (Verde Esmeralda)</option>
                          <option value="UNIFAN_IRECE">UNIFAN Irecê (Verde Floresta)</option>
                          <option value="NOBRE">Colégio Nobre (Azul Claro)</option>
                          <option value="MAPLE">Maple Bear (Vermelho)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Campanha Ativa:
                        </label>
                        <select
                          value={campanhaId}
                          onChange={(e) => setCampanhaId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                        >
                          {campanhas.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Bi-Semana / Vigência:
                        </label>
                        <input
                          type="text"
                          value={biSemana}
                          onChange={(e) => setBiSemana(e.target.value)}
                          placeholder="Ex: BS 21"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Data Início:
                        </label>
                        <input
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Data Término:
                        </label>
                        <input
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Data do Contrato:
                        </label>
                        <input
                          type="date"
                          value={dataContrato}
                          onChange={(e) => setDataContrato(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Ação ao Finalizar:
                        </label>
                        <select
                          value={tipoAcaoFinal}
                          onChange={(e) => setTipoAcaoFinal(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        >
                          <option value="Troca de Lona/Adesivo">Troca de Lona/Adesivo</option>
                          <option value="Retirada Definitiva">Retirada Definitiva</option>
                          <option value="Renovação Contrato">Renovação Contrato</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Número do PI / Contrato:
                        </label>
                        <input
                          type="text"
                          value={numPI}
                          onChange={(e) => setNumPI(e.target.value)}
                          placeholder="PI-2026-..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Valor Negociado (R$):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={valorNegociado}
                          onChange={(e) => setValorNegociado(e.target.value)}
                          placeholder="3200.00"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                  <span>{salvando ? "Salvando no Banco..." : "Salvar Ponto no Mapa"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
