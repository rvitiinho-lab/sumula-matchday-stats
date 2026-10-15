export type CareerStats = { games: number; goals: number; assists: number; saves: number; tackles: number; mvps: number };
export const ACHIEVEMENTS = [
  { id: "debut", title: "Estreia em campo", metric: "games", target: 1, criterion: "Registrar 1 jogo" },
  { id: "regular", title: "Presença de peso", metric: "games", target: 5, criterion: "Registrar 5 jogos" },
  { id: "scorer", title: "Faro de gol", metric: "goals", target: 10, criterion: "Marcar 10 gols" },
  { id: "keeper", title: "Luvas de aço", metric: "saves", target: 10, criterion: "Registrar 10 defesas" },
  { id: "mvp", title: "Protagonista", metric: "mvps", target: 1, criterion: "Conquistar 1 MVP" },
] as const;
export function careerAchievements(stats: CareerStats) {
  return ACHIEVEMENTS.map(a => ({ ...a, progress: Math.min(stats[a.metric], a.target), unlocked: stats[a.metric] >= a.target }));
}