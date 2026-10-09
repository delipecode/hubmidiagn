import { getFornecedoresComMidias } from "@/lib/actions";
import { FornecedoresLista } from "@/components/FornecedoresLista";
import { NovoFornecedorModal } from "@/components/NovoFornecedorModal";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedoresComMidias();

  return (
    <div className="space-y-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Diretório Corporativo • Grupo Nobre</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Veículos & Fornecedores Parceiros
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Clique em qualquer empresa para inspecionar todos os pontos físicos, veiculações contratadas e contatos diretos
          </p>
        </div>

        <div className="self-start md:self-auto">
          <NovoFornecedorModal />
        </div>
      </div>

      {/* LISTA INTERATIVA COM MODAL EXPANSÍVEL */}
      <FornecedoresLista fornecedores={fornecedores} />

    </div>
  );
}
