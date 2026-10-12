export type Modality = "x1" | "x2" | "x5" | "x6" | "x7" | "x11";
export type Team = "colete" | "sem_colete" | "proxima_1" | "proxima_2" | "proxima_3" | "unassigned";

export const MODALITIES: { id: Modality; size: number; max: number }[] = [
  { id: "x1", size: 1, max: 8 },
  { id: "x2", size: 2, max: 16 },
  { id: "x5", size: 5, max: 40 },
  { id: "x6", size: 6, max: 48 },
  { id: "x7", size: 7, max: 56 },
  { id: "x11", size: 11, max: 88 },
];

export const modalityInfo = (m: string) => MODALITIES.find((x) => x.id === m) ?? MODALITIES[2];

export const TEAM_LABEL: Record<Team, string> = {
  colete: "Colete",
  sem_colete: "Sem Colete",
  proxima_1: "Próxima 1",
  proxima_2: "Próxima 2",
  proxima_3: "Próxima 3",
  unassigned: "Aguardando",
};

export interface DrawPlayer {
  id: string;
  queue: number;
  overall: number;
}

/**
 * Hybrid draw: first 2*size players by arrival are balanced between Colete and
 * Sem Colete by overall; the rest fill Próxima 1..3 in arrival order.
 */
export function drawTeams(players: DrawPlayer[], size: number, shuffle = Math.random): Record<string, Team> {
  const ordered = [...players].sort((a, b) => a.queue - b.queue);
  const starters = ordered.slice(0, size * 2);
  const rest = ordered.slice(size * 2);
  const result: Record<string, Team> = {};

  // Sort by overall desc; random tiebreak lets "refazer" produce new teams.
  const ranked = starters
    .map((p) => ({ p, r: shuffle() }))
    .sort((a, b) => b.p.overall - a.p.overall || a.r - b.r)
    .map((x) => x.p);
  let sumA = 0, sumB = 0, nA = 0, nB = 0;
  for (const p of ranked) {
    const aFull = nA >= size, bFull = nB >= size;
    const toA = bFull || (!aFull && (sumA < sumB || (sumA === sumB && shuffle() < 0.5)));
    if (toA) { result[p.id] = "colete"; sumA += p.overall; nA++; }
    else { result[p.id] = "sem_colete"; sumB += p.overall; nB++; }
  }

  const waits: Team[] = ["proxima_1", "proxima_2", "proxima_3"];
  rest.forEach((p, i) => {
    const t = Math.floor(i / size);
    result[p.id] = t < 3 ? waits[t] : "unassigned";
  });
  return result;
}
