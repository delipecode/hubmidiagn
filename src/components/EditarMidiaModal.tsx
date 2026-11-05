"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { editarMidiaCampanha, excluirMidiaCampanha } from "@/lib/actions";
import {
  Edit3,
  X,
  Layers,
  Calendar,
  DollarSign,
  CheckCircle2,
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  Building2,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

interface EditarMidiaModalProps {
  midia: any;
  pontosDisponiveis?: any[];
  fornecedores?: any[];
  onSucesso?: () => void;
}

// Comprime imagem no cliente
function comprimirImagem(file: File, maxWidth = 900, quality = 0.78): Promise<string> {
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

export function EditarMidiaModal({
  midia,
  pontosDisponiveis = [],
  fornecedores = [],
  onSucesso,
}: EditarMidiaModalProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formatoPeca, setFormatoPeca] = useState(midia?.formatoPeca || "");
  const [subtipoMidia, setSubtipoMidia] = useState(midia?.subtipoMidia || "OUTDOOR_BISEMANA");
  const [categoriaMidia, setCategoriaMidia] = useState(midia?.categoriaMidia || "OFFLINE");
  const [biSemana, setBiSemana] = useState(midia?.biSemana || "");
  const [dataInicio, setDataInicio] = useState(midia?.dataInicio || "");
  const [dataFim, setDataFim] = useState(midia?.dataFim || "");
  const [statusVeiculacao, setStatusVeiculacao] = useState(midia?.statusVeiculacao || "No Ar / Ativo");
  const [tipoAcaoFinal, setTipoAcaoFinal] = useState(midia?.tipoAcaoFinal || "Troca de Lona/Adesivo");
  const [valorNegociado, setValorNegociado] = useState(
    midia?.valorNegociado !== null && midia?.valorNegociado !== undefined
      ? String(midia.valorNegociado)
      : ""
  );
  const [numPI, setNumPI] = useState(midia?.numPI || "");
  const [observacoes, setObservacoes] = useState(midia?.observacoes || "");
  const [fornecedorId, setFornecedorId] = useState(midia?.fornecedorId || midia?.fornecedor?.id || "");
  const [pontoFisicoId, setPontoFisicoId] = useState(midia?.pontoFisicoId || midia?.pontoFisico?.id || "");
  const [fotoLocalUrl, setFotoLocalUrl] = useState(midia?.pontoFisico?.fotoLocalUrl || "");

  useEffect(() => {
    if (aberto && midia) {
      setFormatoPeca(midia.formatoPeca || "");
      setSubtipoMidia(midia.subtipoMidia || "OUTDOOR_BISEMANA");
      setCategoriaMidia(midia.categoriaMidia || "OFFLINE");
      setBiSemana(midia.biSemana || "");
      setDataInicio(midia.dataInicio || "");
      setDataFim(midia.dataFim || "");
      setStatusVeiculacao(midia.statusVeiculacao || "No Ar / Ativo");
      setTipoAcaoFinal(midia.tipoAcaoFinal || "Troca de Lona/Adesivo");
      setValorNegociado(
        midia.valorNegociado !== null && midia.valorNegociado !== undefined
          ? String(midia.valorNegociado)
          : ""
      );
      setNumPI(midia.numPI || "");
      setObservacoes(midia.observacoes || "");
      setFornecedorId(midia.fornecedorId || midia.fornecedor?.id || "");
      setPontoFisicoId(midia.pontoFisicoId || midia.pontoFisico?.id || "");
      setFotoLocalUrl(midia.pontoFisico?.fotoLocalUrl || "");
    }
  }, [aberto, midia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessandoFoto(true);
    try {
      const dataUrl = await comprimirImagem(file);
      setFotoLocalUrl(dataUrl);
    } catch (err) {
      console.error("Erro ao comprimir imagem:", err);
      alert("Não foi possível carregar esta foto. Tente outro arquivo.");
    } finally {
      setProcessandoFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      await editarMidiaCampanha(midia.id, {
        fornecedorId: fornecedorId || undefined,
        pontoFisicoId: pontoFisicoId || null,
        categoriaMidia: subtipoMidia.startsWith("META") || subtipoMidia.startsWith("GOOGLE") ? "DIGITAL" : categoriaMidia,
        subtipoMidia,
        formatoPeca,
        biSemana: biSemana || null,
        dataInicio,
        dataFim,
        statusVeiculacao,
        tipoAcaoFinal,
        valorNegociado: valorNegociado ? parseFloat(valorNegociado) : null,
        numPI: numPI || null,
        observacoes: observacoes || null,
        fotoLocalUrl: fotoLocalUrl || null,
      });

      setAberto(false);
      router.refresh();
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao editar mídia:", err);
      alert("Erro ao salvar alterações da mídia/ponto.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar esta mídia / alterar foto do ponto"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            
            {/* TOPO */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
                    Editar Mídia / Ponto da Campanha
                  </h3>
                  <p className="text-xs text-slate-500">
                    Altere formato, datas, bi-semana, status, PI ou troque a foto do ponto
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* STATUS, TIPO DE MÍDIA & TIPO AÇÃO FINAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tipo de Mídia:
                  </label>
                  <select
                    value={subtipoMidia}
                    onChange={(e) => setSubtipoMidia(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="OUTDOOR_BISEMANA">Outdoor (Bi-Semana)</option>
                    <option value="PANFLETO">📄 Panfleto / Flyer Impresso</option>
                    <option value="INDOOR_ACADEMIA">Mídia Indoor • Academia</option>
                    <option value="INDOOR_TELAS">Mídia Indoor • Telas Digitais</option>
                    <option value="LED_DIGITAL">Painel de LED Digital</option>
                    <option value="RADIO">Rádio FM/AM</option>
                    <option value="TV">Mídia de TV</option>
                    <option value="BUSDOOR">Busdoor</option>
                    <option value="META_ADS">Meta Ads (Feed/Stories)</option>
                    <option value="GOOGLE_ADS">Google Ads & YouTube</option>
                    <option value="PORTAL_NOTICIAS">Portal de Notícias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status de Veiculação:
                  </label>
                  <select
                    value={statusVeiculacao}
                    onChange={(e) => setStatusVeiculacao(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="No Ar / Ativo">No Ar / Ativo</option>
                    <option value="Planejada">Planejada / Aguardando</option>
                    <option value="Concluída">Concluída / Encerrada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ação Prevista no Vencimento:
                  </label>
                  <select
                    value={tipoAcaoFinal}
                    onChange={(e) => setTipoAcaoFinal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="Conclusão da Panfletagem">Conclusão da Panfletagem</option>
                    <option value="Reimpressão / Reposição">Reimpressão / Reposição</option>
                    <option value="Troca de Lona/Adesivo">Troca de Lona/Adesivo</option>
                    <option value="Renovação Contrato">Renovação Contrato</option>
                    <option value="Desmobilização Definitiva">Desmobilização Definitiva</option>
                    <option value="Pausar / Avaliar">Pausar / Avaliar</option>
                  </select>
                </div>
              </div>

              {/* FORMATO DA PEÇA */}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                />
              </div>

              {/* BI-SEMANA & DATAS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Bi-Semana (OOH):
                  </label>
                  <input
                    type="text"
                    value={biSemana}
                    onChange={(e) => setBiSemana(e.target.value)}
                    placeholder="Ex: BS 21 (06/10 a 19/10)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Início:
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* VALOR NEGOCIADO & NÚMERO DA PI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Valor Negociado (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorNegociado}
                    onChange={(e) => setValorNegociado(e.target.value)}
                    placeholder="Ex: 2450.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Número do PI / Pedido / Contrato:
                  </label>
                  <input
                    type="text"
                    value={numPI}
                    onChange={(e) => setNumPI(e.target.value)}
                    placeholder="Ex: PI-2026-UNEF-042"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* FOTO DO PONTO / OUTDOOR (TROCA RÁPIDA) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Foto do Ponto / Outdoor:</span>
                  </label>
                  {fotoLocalUrl && (
                    <button
                      type="button"
                      onClick={() => setFotoLocalUrl("")}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      Remover foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {fotoLocalUrl ? (
                    <div className="w-16 h-16 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shrink-0 relative group">
                      <img src={fotoLocalUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white shrink-0">
                      <Camera className="w-6 h-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processandoFoto}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{processandoFoto ? "Otimizando..." : "Carregar Foto do Computador"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="url"
                        value={fotoLocalUrl.startsWith("data:") ? "" : fotoLocalUrl}
                        onChange={(e) => setFotoLocalUrl(e.target.value)}
                        placeholder="Ou cole a URL direta da imagem (https://...)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-[11px] outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Observações Internas:
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Face com iluminação noturna voltada para o fluxo centro-bairro."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* AÇÕES */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || processandoFoto}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{salvando ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
