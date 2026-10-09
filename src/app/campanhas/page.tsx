import { getDashboardData } from "@/lib/actions";
import { NovaCampanhaModal } from "@/components/NovaCampanhaModal";
import { CampanhasClient } from "@/components/CampanhasClient";
import Link from "next/link";
import { Layers, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampanhasPage() {
  const data = await getDashboardData();
  const { campanhas, pontos, fornecedores } = data;

  return (
    <div className="space-y-8">
      {/* CABEÇALHO DA TELA DE CAMPANHAS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Ecossistema Multi-Canal • Grupo Nobre</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Campanhas & Inventário de Mídias
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Gerencie campanhas, edite dados, vincule pontos físicos e audite veiculações de cada empresa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NovaCampanhaModal />
          <Link
            href="/pontos"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-200 transition-all shadow-sm"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Mapa de Mídia</span>
          </Link>
        </div>
      </div>

      {/* COMPONENTE CLIENT UNIFICADO COM FILTROS DE MARCA, CANAIS E AÇÕES CRUD */}
      <CampanhasClient
        campanhas={campanhas as any}
        pontosDisponiveis={pontos as any}
        fornecedores={fornecedores as any}
      />
    </div>
  );
}
