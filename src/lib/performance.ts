import type { MatchPlayer } from "./match-data";

export const WEIGHTS = { goals: 5, assists: 3, tackles: 2, saves: 1, difficult_saves: 2, shots_on_goal: 0.5, fouls_suffered: 0.5, fouls_committed: -0.5, victory_points: 1 } as const;
export const STAT_LABELS = { goals: "Gols", assists: "Assistências", tackles: "Desarmes", saves: "Defesas comuns", difficult_saves: "Defesas difíceis", shots_on_goal: "Chutes no gol", fouls_suffered: "Faltas sofridas", fouls_committed: "Faltas cometidas", victory_points: "Vitória" };
export const statKeys = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[];
export const points = (p: Pick<MatchPlayer, keyof typeof WEIGHTS>) => statKeys.reduce((sum, key) => sum + (p[key] ?? 0) * WEIGHTS[key], 0);
export const actions = (p: Pick<MatchPlayer, keyof typeof WEIGHTS>) => statKeys.filter(k => k !== "victory_points").reduce((sum, key) => sum + (p[key] ?? 0), 0);
export const fmtPoints = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export type Performance = { player: MatchPlayer; points: number; actions: number; mvps: number };
export type Award = { status: "winner" | "tie" | "insufficient"; leaders: Performance[] };
export function selectAward(rows: Performance[], night = false): Award {
  if (rows.filter(r => r.actions > 0).length < 2) return { status: "insufficient", leaders: [] };
  const sorted = [...rows].sort((a,b) => b.points-a.points || (night ? b.mvps-a.mvps : 0));
  const first = sorted[0];
  if (!first || first.points <= 0) return { status: "insufficient", leaders: [] };
  const leaders = sorted.filter(r => r.points === first.points && (!night || r.mvps === first.mvps));
  return { status: leaders.length === 1 ? "winner" : "tie", leaders };
}
export const roundPerformances = (players: MatchPlayer[]): Performance[] => players.map(player => ({ player, points: points(player), actions: actions(player), mvps: 0 }));
export function aggregateNight(rounds: { match: { id: string; pelada_id: string | null; status: string | null }; players: MatchPlayer[] }[], root: string): Performance[] {
  const totals = new Map<string, Performance>();
  for (const round of rounds.filter(r => r.match.status === "finished" && (r.match.pelada_id ?? r.match.id) === root)) {
    const rows = roundPerformances(round.players);
    const award = selectAward(rows);
    for (const row of rows) {
      const previous = totals.get(row.player.player_id);
      const player = { ...row.player };
      if (previous) for (const key of statKeys) player[key] = (previous.player[key] ?? 0) + (player[key] ?? 0);
      totals.set(player.player_id, { player, points: (previous?.points ?? 0)+row.points, actions: (previous?.actions ?? 0)+row.actions, mvps: (previous?.mvps ?? 0)+(award.status === "winner" && award.leaders[0]?.player.player_id === player.player_id ? 1 : 0) });
    }
  }
  return [...totals.values()].sort((a,b) => b.points-a.points || b.mvps-a.mvps);
}
export const messageValid = (message: string) => Array.from(message).length <= 120;