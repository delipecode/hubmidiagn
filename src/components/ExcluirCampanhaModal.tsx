"use client";

import { useState } from "react";
import { excluirCampanha } from "@/lib/actions";
import { Trash2, X, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ExcluirCampanhaModalProps {
  campanhaId: string;
  campanhaNome: string;
  onSucesso?: () => void;
}

export function ExcluirCampanhaModal({
  campanhaId,
  campanhaNome,
  onSucesso,
}: ExcluirCampanhaModalProps) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const handleExcluir = async () => {
    setExcluindo(true);

    try {
      await excluirCampanha(campanhaId);
      setAberto(false);
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao excluir campanha:", err);
      alert("Erro ao excluir campanha. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-rose-200"
        title="Remover Campanha"
      >
        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
        <span>Remover</span>
      </button>

      {/* MODAL DE CONFIRMAÇÃO */}
      {aberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <span>Confirmar Exclusão</span>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                Tem certeza que deseja remover a campanha{" "}
                <span className="font-bold text-slate-900">"{campanhaNome}"</span>?
              </p>
              <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                ⚠️ Os pontos físicos vinculados retornarão automaticamente para o status de{" "}
                <span className="font-bold text-blue-700">"Disponível / Mapeado"</span>.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                disabled={excluindo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{excluindo ? "Excluindo..." : "Sim, Excluir"}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
