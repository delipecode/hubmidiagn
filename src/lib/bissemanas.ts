// Sistema de Calendário Oficial de Bi-Semanas OOH (Central de Outdoor / Mercado Publicitário)
// Cada Bi-Semana possui 14 dias de veiculação e segue o calendário anual oficial.

export interface BiSemana {
  numero: string; // "01", "02", ... "23", "24"
  numeroInt: number;
  nome: string; // "BS 23"
  ano: number;
  dataInicio: string; // "YYYY-MM-DD"
  dataFim: string; // "YYYY-MM-DD"
  periodo: string; // "03/11 a 16/11"
  label: string; // "BS 23 (03/11 a 16/11)"
  labelComAno: string; // "BS 23 (03/11 a 16/11/2026)"
  colagem: string; // "02/11 (Dom)"
  descolagem: string; // "16/11 (Seg)"
  prazoLona: string;
  status: "ENCERRADA" | "ATUAL" | "PROXIMA" | "FUTURA";
}

// Data base canônica de ancoragem: BS 21 de 2026 inicia em 06/10/2026
// (Alinhada com os contratos e catalogação oficial do Grupo Nobre / Bullos Outdoor)
const ANCORA_BS21_2026 = new Date("2026-10-06T12:00:00Z");

const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatarDiaMes(d: Date): string {
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function formatarISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Gera a lista completa de Bi-Semanas para um determinado ano (1 a 26)
 */
export function getBiSemanasAno(ano = 2026, dataReferencia?: Date | string): BiSemana[] {
  const ref = dataReferencia
    ? typeof dataReferencia === "string"
      ? new Date(`${dataReferencia}T12:00:00Z`)
      : dataReferencia
    : new Date();

  const refISO = formatarISODate(ref);

  const lista: BiSemana[] = [];

  for (let i = 1; i <= 26; i++) {
    // Cálculo dos dias a partir da âncora
    // Diferença em semanas em relação à BS 21 de 2026
    const diffAnos = ano - 2026;
    const diffBS = (i - 21) + (diffAnos * 26);
    const diffDias = diffBS * 14;

    const inicio = new Date(ANCORA_BS21_2026.getTime() + diffDias * 24 * 60 * 60 * 1000);
    const fim = new Date(inicio.getTime() + 13 * 24 * 60 * 60 * 1000);
    const colagem = new Date(inicio.getTime() - 1 * 24 * 60 * 60 * 1000);
    const descolagem = new Date(fim.getTime());

    const inicioISO = formatarISODate(inicio);
    const fimISO = formatarISODate(fim);

    let status: BiSemana["status"] = "FUTURA";
    if (refISO > fimISO) {
      status = "ENCERRADA";
    } else if (refISO >= inicioISO && refISO <= fimISO) {
      status = "ATUAL";
    } else {
      // Verifica se é a próxima
      const diasAteInicio = Math.round((inicio.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000));
      if (diasAteInicio >= 0 && diasAteInicio <= 14) {
        status = "PROXIMA";
      } else {
        status = "FUTURA";
      }
    }

    const numStr = String(i).padStart(2, "0");
    const periodoStr = `${formatarDiaMes(inicio)} a ${formatarDiaMes(fim)}`;

    lista.push({
      numero: numStr,
      numeroInt: i,
      nome: `BS ${numStr}`,
      ano,
      dataInicio: inicioISO,
      dataFim: fimISO,
      periodo: periodoStr,
      label: `BS ${numStr} (${periodoStr})`,
      labelComAno: `BS ${numStr} (${periodoStr}/${ano})`,
      colagem: `${formatarDiaMes(colagem)} (${DIAS_SEMANA_ABREV[colagem.getUTCDay()]})`,
      descolagem: `${formatarDiaMes(descolagem)} (${DIAS_SEMANA_ABREV[descolagem.getUTCDay()]})`,
      prazoLona: `Entregar lonas até ${formatarDiaMes(new Date(inicio.getTime() - 4 * 24 * 60 * 60 * 1000))}`,
      status,
    });
  }

  return lista;
}

/**
 * Retorna a Bi-Semana atualmente ativa para uma data de referência
 */
export function getBiSemanaAtual(dataReferencia?: Date | string): BiSemana {
  const ref = dataReferencia
    ? typeof dataReferencia === "string"
      ? new Date(`${dataReferencia}T12:00:00Z`)
      : dataReferencia
    : new Date();

  const ano = ref.getUTCFullYear();
  const biSemanas = getBiSemanasAno(ano, ref);

  const atual = biSemanas.find((bs) => bs.status === "ATUAL");
  if (atual) return atual;

  // Se a data de hoje estiver exatamente no limiar ou virada
  const proxima = biSemanas.find((bs) => bs.status === "PROXIMA");
  if (proxima) return proxima;

  // Fallback seguro: BS 23 de 2026 se for em torno de nov/2026
  return biSemanas.find((bs) => bs.numero === "23") || biSemanas[0];
}

/**
 * Retorna a próxima Bi-Semana que entrará em veiculação
 */
export function getProximaBiSemana(dataReferencia?: Date | string): BiSemana {
  const atual = getBiSemanaAtual(dataReferencia);
  const ano = atual.ano;
  const biSemanas = getBiSemanasAno(ano, dataReferencia);

  const proxIndex = biSemanas.findIndex((bs) => bs.numero === atual.numero) + 1;
  if (proxIndex < biSemanas.length) {
    return biSemanas[proxIndex];
  }

  // Se virar o ano, pega a BS 01 do ano seguinte
  const biSemanasProxAno = getBiSemanasAno(ano + 1);
  return biSemanasProxAno[0];
}

/**
 * Busca uma Bi-Semana correspondente a um texto ou número (ex: "BS 23", "23", "BS 23 (03/11 a 16/11)")
 */
export function encontrarBiSemanaPorTexto(texto: string, ano = 2026): BiSemana | null {
  if (!texto) return null;
  const normalizado = texto.trim().toUpperCase();

  const todas = getBiSemanasAno(ano);
  return (
    todas.find(
      (bs) =>
        normalizado.includes(`BS ${bs.numero}`) ||
        normalizado.includes(`BS${bs.numero}`) ||
        normalizado === bs.numero ||
        normalizado === String(bs.numeroInt)
    ) || null
  );
}

/**
 * Busca uma Bi-Semana correspondente a uma data específica
 */
export function getBiSemanaPorData(dataISO: string): BiSemana | null {
  if (!dataISO) return null;
  const d = new Date(`${dataISO}T12:00:00Z`);
  if (isNaN(d.getTime())) return null;

  const ano = d.getUTCFullYear();
  const biSemanas = getBiSemanasAno(ano, d);

  return biSemanas.find((bs) => dataISO >= bs.dataInicio && dataISO <= bs.dataFim) || null;
}
