"use client";

import { useState } from "react";
import { editarCampanha } from "@/lib/actions";
import { Edit3, X, Layers, Calendar, DollarSign, CheckCircle2 } from "lucide-react";

interface EditarCampanhaModalProps {
  campanha: {
    id: string;
    marcaId: string;
    nome: string;
    objetivo: string | null;
    dataInicio: string;
    dataFim: string;
    status: string;
    orcamentoTotal: number | null;
  };
  onSucesso?: () => void;
}

export function EditarCampanhaModal({ campanha, onSucesso }: EditarCampanhaModalProps) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [marcaId, setMarcaId] = useState(campanha.marcaId);
  const [nome, setNome] = useState(campanha.nome);
  const [objetivo, setObjetivo] = useState(campanha.objetivo || "");
  const [dataInicio, setDataInicio] = useState(campanha.dataInicio);
  const [dataFim, setDataFim] = useState(campanha.dataFim);
  const [status, setStatus] = useState(campanha.status);
  const [orcamentoTotal, setOrcamentoTotal] = useState(
    campanha.orcamentoTotal ? campanha.orcamentoTotal.toString() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      await editarCampanha(campanha.id, {
        marcaId,
        nome,
        objetivo,
        dataInicio,
        dataFim,
        status,
        orcamentoTotal: orcamentoTotal ? parseFloat(orcamentoTotal) : undefined,
      });

      setAberto(false);
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao editar campanha:", err);
      alert("Erro ao editar campanha. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200"
        title="Editar Campanha"
      >
        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
        <span>Editar</span>
      </button>

      {/* MODAL */}
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
                    Editar Campanha
                  </h3>
                  <p className="text-xs text-slate-500">
                    Altere os dados, vigência e status da campanha
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
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Marca do Grupo Nobre:
                  </label>
                  <select
                    value={marcaId}
                    onChange={(e) => setMarcaId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="UNEF">UNEF (Laranja)</option>
                    <option value="UNIFAN">UNIFAN (Azul Royal)</option>
                    <option value="NOBRE">Colégio Nobre (Azul Claro)</option>
                    <option value="MAPLE">Maple Bear (Vermelho)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="Ativa">Ativa (Em veiculação)</option>
                    <option value="Planejada">Planejada (Futura)</option>
                    <option value="Concluída">Concluída (Encerrada)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nome da Campanha:
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Vestibular 2027.1 Medicina"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Objetivo / Descrição da Campanha:
                </label>
                <textarea
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={3}
                  placeholder="Ex: Captação de novos alunos."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Orçamento Estimado (R$ opcional):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={orcamentoTotal}
                  onChange={(e) => setOrcamentoTotal(e.target.value)}
                  placeholder="Ex: 35000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                />
              </div>

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
                  disabled={salvando}
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
