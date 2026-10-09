import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(dataStr?: string | null) {
  if (!dataStr) return "-";
  const partes = dataStr.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
}

export function calcularDiasRestantes(dataFimStr?: string | null): { dias: number; status: "vencido" | "urgente" | "atencao" | "normal" } {
  if (!dataFimStr) return { dias: 0, status: "normal" };
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fim = new Date(dataFimStr);
  fim.setHours(0, 0, 0, 0);

  const diffMs = fim.getTime() - hoje.getTime();
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (dias < 0) return { dias, status: "vencido" };
  if (dias <= 3) return { dias, status: "urgente" };
  if (dias <= 7) return { dias, status: "atencao" };
  return { dias, status: "normal" };
}
