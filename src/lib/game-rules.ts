import type { MatchPlayer } from "./match-data";

export function eligiblePlayers(players: MatchPlayer[]) {
  return players.filter(p => p.presence === "confirmed" && (p.team === "colete" || p.team === "sem_colete"));
}
export function elapsedSeconds(start: string | null, end: string | null, now: number) {
  if (!start) return 0;
  return Math.max(0, Math.floor(((end ? new Date(end).getTime() : now) - new Date(start).getTime()) / 1000));
}
export function ratingValid(score: number) { return Number.isInteger(score) && score >= 1 && score <= 10; }