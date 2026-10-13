import type { MatchPlayer } from "./match-data";

export const arrival = (p: MatchPlayer) => p.arrival_order ?? p.queue_position;
export function waitingTeams(players: MatchPlayer[], size: number) {
  const queued = players.filter(p => p.presence === "confirmed" && p.team !== "colete" && p.team !== "sem_colete").sort((a, b) => arrival(a) - arrival(b));
  const complete = Math.floor(queued.length / size);
  return { teams: Array.from({ length: complete }, (_, i) => queued.slice(i * size, (i + 1) * size)), reserves: queued.slice(complete * size), queued };
}