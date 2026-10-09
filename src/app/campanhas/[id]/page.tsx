import { getCampanhaPorId, getDashboardData } from "@/lib/actions";
import { notFound } from "next/navigation";
import { CampanhaDetalheClient } from "@/components/CampanhaDetalheClient";

export const dynamic = "force-dynamic";

export default async function CampanhaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campanha, data] = await Promise.all([
    getCampanhaPorId(id),
    getDashboardData(),
  ]);

  if (!campanha) {
    notFound();
  }

  return (
    <CampanhaDetalheClient
      campanha={campanha as any}
      pontosDisponiveis={data.pontos as any}
      fornecedores={data.fornecedores as any}
    />
  );
}

