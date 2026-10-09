"use client";

import { useState } from "react";
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
} from "lucide-react";

interface NovoPontoModalProps {
  fornecedores: any[];
  campanhas: any[];
  onSucesso?: () => void;
}

export function NovoPontoModal({
  fornecedores,
  campanhas,
  onSucesso,
}: NovoPontoModalProps) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Estados do Formulário
  const [fornecedorId, setFornecedorId] = useState(fornecedores[0]?.id || "");
  const [codigoIdentificador, setCodigoIdentificador] = useState("");
  const [nomeLocal, setNomeLocal] = useState("");
  const [tipoFormato, setTipoFormato] = useState("Outdoor Lona 9x3m");
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
  const [dataInicio, setDataInicio] = useState("2026-10-06");
  const [dataFim, setDataFim] = useState("2026-10-19");
  const [tipoAcaoFinal, setTipoAcaoFinal] = useState("Troca de Lona/Adesivo");
  const [numPI, setNumPI] = useState("");
  const [valorNegociado, setValorNegociado] = useState("");

  // Sugestões rápidas de coordenadas para bairros de Feira de Santana
  const bairrosCoordenadas: Record<string, { lat: string; lng: string }> = {
    "Santa Mônica": { lat: "-12.2512", lng: "-38.9554" },
    Centro: { lat: "-12.2580", lng: "-38.9710" },
    Capuchinhos: { lat: "-12.2615", lng: "-38.9642" },
    "Fraga Maia": { lat: "-12.2390", lng: "-38.9605" },
    Sim: { lat: "-12.2685", lng: "-38.9320" },
    Kalilândia: { lat: "-12.2550", lng: "-38.9680" },
    Muchila: { lat: "-12.2710", lng: "-38.9750" },
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
        praca: "Feira de Santana",
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
        onClick={() => setAberto(true)}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Ponto (Outdoor / LED / Academia)</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Bairro (Feira de Santana):
                    </label>
                    <select
                      value={bairro}
                      onChange={(e) => handleBairroChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Santa Mônica">Santa Mônica</option>
                      <option value="Centro">Centro</option>
                      <option value="Capuchinhos">Capuchinhos</option>
                      <option value="Fraga Maia">Fraga Maia</option>
                      <option value="Sim">Sim (Noide Cerqueira)</option>
                      <option value="Kalilândia">Kalilândia</option>
                      <option value="Muchila">Muchila</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Endereço Completo:
                    </label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Ex: Av. Getúlio Vargas, 2400"
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

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Link da Foto do Ponto / Fachada (URL):
                  </label>
                  <input
                    type="url"
                    value={fotoLocalUrl}
                    onChange={(e) => setFotoLocalUrl(e.target.value)}
                    placeholder="https://... (Foto do outdoor ou academia)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          Número do PI:
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
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
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
