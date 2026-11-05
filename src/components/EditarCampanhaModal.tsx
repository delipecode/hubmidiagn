"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { editarCampanha } from "@/lib/actions";
import { Edit3, X, Layers, Calendar, DollarSign, CheckCircle2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const OPCOES_MARCAS = [
  {
    id: "UNEF",
    nome: "UNEF",
    descricao: "Graduação, Saúde e Tecnologia",
    corBadge: "bg-[#F59E13] text-slate-950",
    corBordaAtiva: "border-amber-500 bg-amber-50/60",
    corCheck: "bg-amber-500 text-slate-950",
    corDot: "bg-amber-500",
  },
  {
    id: "UNIFAN",
    nome: "UNIFAN (Sede)",
    descricao: "Centro Universitário Nobre Feira",
    corBadge: "bg-[#2563EB] text-white",
    corBordaAtiva: "border-blue-600 bg-blue-50/60",
    corCheck: "bg-blue-600 text-white",
    corDot: "bg-blue-600",
  },
  {
    id: "UNIFAN_IPIRA",
    nome: "UNIFAN Ipirá",
    descricao: "Polo Regional Ipirá & BA-052",
    corBadge: "bg-[#059669] text-white",
    corBordaAtiva: "border-emerald-600 bg-emerald-50/60",
    corCheck: "bg-emerald-600 text-white",
    corDot: "bg-emerald-600",
  },
  {
    id: "UNIFAN_IRECE",
    nome: "UNIFAN Irecê",
    descricao: "Polo Regional Chapada & Irecê",
    corBadge: "bg-[#166534] text-white",
    corBordaAtiva: "border-green-800 bg-green-50/60",
    corCheck: "bg-green-800 text-white",
    corDot: "bg-green-800",
  },
  {
    id: "NOBRE",
    nome: "Colégio Nobre",
    descricao: "Educação Básica e Integral",
    corBadge: "bg-[#0284C7] text-white",
    corBordaAtiva: "border-sky-600 bg-sky-50/60",
    corCheck: "bg-sky-600 text-white",
    corDot: "bg-sky-600",
  },
  {
    id: "MAPLE",
    nome: "Maple Bear",
    descricao: "Metodologia Canadense Bilíngue",
    corBadge: "bg-[#E11D48] text-white",
    corBordaAtiva: "border-rose-600 bg-rose-50/60",
    corCheck: "bg-rose-600 text-white",
    corDot: "bg-rose-600",
  },
];

interface EditarCampanhaModalProps {
  campanha: {
    id: string;
    marcaId: string;
    marcasMultiplas?: string | null;
    nome: string;
    objetivo: string | null;
    dataInicio: string;
    dataFim: string;
    status: string;
    orcamentoTotal: number | null;
  };
  onSucesso?: () => void;
  className?: string;
}

export function EditarCampanhaModal({ campanha, onSucesso, className }: EditarCampanhaModalProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const initialMarcas = (campanha.marcasMultiplas || campanha.marcaId || "UNEF")
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);

  const [marcasSelecionadas, setMarcasSelecionadas] = useState<string[]>(initialMarcas);
  const [nome, setNome] = useState(campanha.nome);
  const [objetivo, setObjetivo] = useState(campanha.objetivo || "");
  const [dataInicio, setDataInicio] = useState(campanha.dataInicio);
  const [dataFim, setDataFim] = useState(campanha.dataFim);
  const [status, setStatus] = useState(campanha.status);
  const [orcamentoTotal, setOrcamentoTotal] = useState(
    campanha.orcamentoTotal ? campanha.orcamentoTotal.toString() : ""
  );

  useEffect(() => {
    if (aberto) {
      const currentMarcas = (campanha.marcasMultiplas || campanha.marcaId || "UNEF")
        .split(",")
        .map((m) => m.trim().toUpperCase())
        .filter(Boolean);

      setMarcasSelecionadas(currentMarcas.length > 0 ? currentMarcas : ["UNEF"]);
      setNome(campanha.nome);
      setObjetivo(campanha.objetivo || "");
      setDataInicio(campanha.dataInicio);
      setDataFim(campanha.dataFim);
      setStatus(campanha.status);
      setOrcamentoTotal(campanha.orcamentoTotal ? campanha.orcamentoTotal.toString() : "");
    }
  }, [campanha, aberto]);

  const toggleMarca = (id: string) => {
    if (marcasSelecionadas.includes(id)) {
      if (marcasSelecionadas.length > 1) {
        setMarcasSelecionadas(marcasSelecionadas.filter((m) => m !== id));
      }
    } else {
      setMarcasSelecionadas([...marcasSelecionadas, id]);
    }
  };

  const selecionarTodas = () => {
    setMarcasSelecionadas(["UNEF", "UNIFAN", "UNIFAN_IPIRA", "UNIFAN_IRECE", "NOBRE", "MAPLE"]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (marcasSelecionadas.length === 0) {
      alert("Selecione pelo menos uma marca do Grupo Nobre.");
      return;
    }

    setSalvando(true);

    try {
      await editarCampanha(campanha.id, {
        marcaId: marcasSelecionadas[0],
        marcasIds: marcasSelecionadas,
        marcasMultiplas: marcasSelecionadas.join(", "),
        nome,
        objetivo,
        dataInicio,
        dataFim,
        status,
        orcamentoTotal: orcamentoTotal ? parseFloat(orcamentoTotal) : undefined,
      });

      setAberto(false);
      router.refresh();
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
        className={
          className ||
          "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200"
        }
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
                    Altere marcas, vigência, metas e status da campanha
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
              
              {/* SELEÇÃO MÚLTIPLA DE MARCAS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Marcas do Grupo Nobre (Múltipla Escolha):</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={selecionarTodas}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Selecionar Todas
                  </button>
                </div>

                {/* GRID DE CARDS COM MÚLTIPLA ESCOLHA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OPCOES_MARCAS.map((marca) => {
                    const isSelected = marcasSelecionadas.includes(marca.id);
                    return (
                      <div
                        key={marca.id}
                        onClick={() => toggleMarca(marca.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        className={cn(
                          "cursor-pointer p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between select-none",
                          isSelected
                            ? cn("shadow-sm ring-1 ring-offset-0", marca.corBordaAtiva)
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 opacity-75"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-lg border flex items-center justify-center transition-colors",
                              isSelected
                                ? marca.corCheck
                                : "border-slate-300 bg-white"
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 rounded text-[10px] font-black tracking-wide",
                                marca.corBadge
                              )}
                            >
                              {marca.nome}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              {marca.descricao}
                            </p>
                          </div>
                        </div>

                        <div className={cn("w-2 h-2 rounded-full", marca.corDot, isSelected ? "opacity-100" : "opacity-30")} />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-0.5 text-[11px] text-slate-600 font-medium">
                  <strong className="text-slate-900 font-bold">{marcasSelecionadas.length}</strong> {marcasSelecionadas.length === 1 ? "marca vinculada" : "marcas vinculadas"}: {marcasSelecionadas.join(", ")}
                </div>
              </div>

              {/* NOME E STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nome da Campanha:
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  />
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

              {/* OBJETIVO */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Objetivo / Descrição da Campanha:
                </label>
                <textarea
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* VIGÊNCIA E ORÇAMENTO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Início:
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Término:
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Orçamento Total:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={orcamentoTotal}
                    onChange={(e) => setOrcamentoTotal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  />
                </div>
              </div>

              {/* AÇÕES */}
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
