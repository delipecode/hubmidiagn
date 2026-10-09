import { getCentralTerritorialData } from "@/lib/actions";
import { CentralTerritorial } from "@/components/CentralTerritorial";

export const dynamic = "force-dynamic";

export default async function PontosPage() {
  const data = await getCentralTerritorialData();
  const { pontos, checkings, fornecedores, campanhas } = data;

  return (
    <CentralTerritorial
      pontos={pontos}
      checkings={checkings}
      fornecedores={fornecedores}
      campanhas={campanhas}
    />
  );
}
