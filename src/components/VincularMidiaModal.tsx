"use client";

import { useState } from "react";
import { adicionarMidiaCampanha } from "@/lib/actions";
import { Plus, X, Layers, Building2, Calendar, CheckCircle2 } from "lucide-react";

interface VincularMidiaModalProps {
  campanhaId: string;
  marcaId: string;
  campanhaNome: string;
  pontosDisponiveis?: any[];
  fornecedores?: any[];
  onSucesso?: () => void;
}

export function VincularMidiaModal({
  campanhaId,
  marcaId,
  campanhaNome,
  pontosDisponiveis = [],
  fornecedores = [],
  onSucesso,
}: VincularMidiaModalProps) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [tipoCanal, setTipoCanal] = useState<"PONTO_FISICO" | "CANAL_DIRETO">("PONTO_FISICO");
  const [pontoFisicoId, setPontoFisicoId] = useState(pontosDisponiveis[0]?.id || "");
  const [fornecedorId, setFornecedorId] = useState(fornecedores[0]?.id || "FORN-BULLOS");
  const [subtipoMidia, setSubtipoMidia] = useState("OUTDOOR_BISEMANA");
  const [formatoPeca, setFormatoPeca] = useState("Lona 9,00 x 3,00m");
  const [biSemana, setBiSemana] = useState("BS 21 (06/10 a 19/10)");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [tipoAcaoFinal, setTipoAcaoFinal] = useState("Troca de Lona/Adesivo");
  const [valorNegociado, setValorNegociado] = useState("");
  const [numPI, setNumPI] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      let finalFornecedorId = fornecedorId;
      let finalPontoId = pontoFisicoId;

      if (tipoCanal === "PONTO_FISICO") {
        const ponto = pontosDisponiveis.find((p) => p.id === pontoFisicoId);
        if (ponto) {
          finalFornecedorId = ponto.fornecedorId;
        }
      } else {
        finalPontoId = "";
      }

      await adicionarMidiaCampanha({
        campanhaId,
        marcaId,
        fornecedorId: finalFornecedorId,
        pontoFisicoId: finalPontoId || null,
        categoriaMidia: subtipoMidia.startsWith("META") || subtipoMidia.startsWith("GOOGLE") ? "DIGITAL" : "OFFLINE",
        subtipoMidia,
        formatoPeca,
        biSemana: subtipoMidia === "OUTDOOR_BISEMANA" ? biSemana : undefined,
        dataInicio,
        dataFim,
        tipoAcaoFinal,
        valorNegociado: valorNegociado ? parseFloat(valorNegociado) : undefined,
        numPI: numPI || undefined,
        observacoes: observacoes || undefined,
      });

      setAberto(false);
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao vincular mídia:", err);
      alert("Erro ao vincular mídia à campanha.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-blue-200"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Vincular Mídia / Ponto</span>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    Vincular Mídia à Campanha
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Campanha: <span className="font-bold text-slate-800">{campanhaNome}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* TIPO DE VINCULAÇÃO */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTipoCanal("PONTO_FISICO")}
                  className={`py-2 rounded-lg font-bold transition-all text-xs ${
                    tipoCanal === "PONTO_FISICO"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📍 Ponto Catalogado (OOH/Indoor)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCanal("CANAL_DIRETO")}
                  className={`py-2 rounded-lg font-bold transition-all text-xs ${
                    tipoCanal === "CANAL_DIRETO"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📻 Rádio, TV ou Digital
                </button>
              </div>

              {tipoCanal === "PONTO_FISICO" ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Selecione o Ponto Físico Catalogado:
                  </label>
                  <select
                    value={pontoFisicoId}
                    onChange={(e) => {
                      setPontoFisicoId(e.target.value);
                      const p = pontosDisponiveis.find((item) => item.id === e.target.value);
                      if (p) {
                        setFormatoPeca(p.tipoFormato);
                        if (p.tipoFormato.includes("Outdoor")) setSubtipoMidia("OUTDOOR_BISEMANA");
                        else if (p.tipoFormato.includes("Academia")) setSubtipoMidia("INDOOR_ACADEMIA");
                        else if (p.tipoFormato.includes("LED")) setSubtipoMidia("LED_DIGITAL");
                        else if (p.tipoFormato.includes("Tela")) setSubtipoMidia("INDOOR_TELAS");
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-bold"
                  >
                    {pontosDisponiveis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nomeLocal} ({p.tipoFormato} • {p.bairro})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Veículo / Fornecedor:
                    </label>
                    <select
                      value={fornecedorId}
                      onChange={(e) => setFornecedorId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
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
                      Tipo de Canal:
                    </label>
                    <select
                      value={subtipoMidia}
                      onChange={(e) => setSubtipoMidia(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="RADIO">Rádio FM (Spots / Inserções)</option>
                      <option value="TV">Mídia de TV (VTs Comerciais)</option>
                      <option value="META_ADS">Meta Ads (Feed & Stories)</option>
                      <option value="GOOGLE_ADS">Google Ads / YouTube</option>
                      <option value="PORTAL_NOTICIAS">Portal de Notícias</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Formato / Especificação da Peça:
                </label>
                <input
                  type="text"
                  value={formatoPeca}
                  onChange={(e) => setFormatoPeca(e.target.value)}
                  placeholder="Ex: Lona 9,00 x 3,00m, Spot 30s 8x/dia, Vídeo 15s LED"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Início:
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Fim:
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ação Operacional ao Finalizar:
                  </label>
                  <select
                    value={tipoAcaoFinal}
                    onChange={(e) => setTipoAcaoFinal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Troca de Lona/Adesivo">Troca de Lona/Adesivo</option>
                    <option value="Renovação Contrato">Renovação de Contrato</option>
                    <option value="Retirada Definitiva">Retirada Definitiva / Desmobilização</option>
                    <option value="Pausar Anúncios">Pausar Anúncios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Valor Negociado (R$ opcional):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorNegociado}
                    onChange={(e) => setValorNegociado(e.target.value)}
                    placeholder="Ex: 1450.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{salvando ? "Salvando..." : "Confirmar Vinculação"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
