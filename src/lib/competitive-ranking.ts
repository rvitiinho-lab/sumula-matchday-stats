/** Competitive scoring is deliberately independent from MVP and OVR. */
export const COMPETITIVE_RULES = { minimumSeconds: 480, minimumPeladas: 5, minimumEventPlayers: 2, priorWeight: 3, priorScore: 50 } as const;
export type CompetitiveActions = { goals: number; assists: number; tackles: number; saves: number; difficult_saves: number; shots_on_goal: number; fouls_suffered: number; fouls_committed: number };
export function competitiveRound(actions: CompetitiveActions, result: 'win' | 'draw' | 'loss') {
  const a = Math.max(0, 5 * actions.goals + 3 * actions.assists + 2 * actions.tackles + actions.saves + 2 * actions.difficult_saves + 0.5 * actions.shots_on_goal + 0.5 * actions.fouls_suffered - 0.5 * actions.fouls_committed);
  const individual = 70 * a / (a + 10);
  return { individual, score: individual + (result === 'win' ? 30 : result === 'draw' ? 15 : 0) };
}
export type CompetitiveRound = { id: string; pelada: string; score: number; individual: number; win: boolean };
export function competitiveSummary(rounds: CompetitiveRound[]) {
  const unique = new Map(rounds.map(round => [round.id, round]));
  const peladas = new Map<string, CompetitiveRound[]>();
  for (const round of unique.values()) peladas.set(round.pelada, [...(peladas.get(round.pelada) ?? []), round]);
  const means = [...peladas.values()].map(rows => ({ score: rows.reduce((s, r) => s + r.score, 0) / rows.length, individual: rows.reduce((s, r) => s + r.individual, 0) / rows.length, wins: rows.filter(r => r.win).length / rows.length }));
  const n = means.length;
  return { peladas: n, remaining: Math.max(0, COMPETITIVE_RULES.minimumPeladas - n), qualified: n >= COMPETITIVE_RULES.minimumPeladas, score: (means.reduce((s, r) => s + r.score, 0) + 150) / (n + 3), individual: n ? means.reduce((s, r) => s + r.individual, 0) / n : 0, wins: n ? means.reduce((s, r) => s + r.wins, 0) / n : 0 };
}
export type Rankable = { id: string; nickname: string; score: number; individual: number; wins: number; qualified: boolean };
export function assignCompetitivePositions<T extends Rankable>(players: T[]) {
  const sorted = players.filter(p => p.qualified).sort((a, b) => b.score - a.score || b.individual - a.individual || b.wins - a.wins || a.nickname.localeCompare(b.nickname, 'pt-BR') || a.id.localeCompare(b.id));
  let position = 0;
  return sorted.map((p, i) => { const previous = sorted[i - 1]; if (!previous || p.score !== previous.score || p.individual !== previous.individual || p.wins !== previous.wins) position = i + 1; return { ...p, position }; });
}
export function competitiveEligibility(input: { closed: boolean; started: boolean; finished: boolean; seconds: number; bothTeams: boolean; eventPlayers: number; consistent: boolean; active: boolean }) {
  return input.closed && input.started && input.finished && input.seconds >= 480 && input.bothTeams && input.eventPlayers >= 2 && input.consistent && input.active;
}