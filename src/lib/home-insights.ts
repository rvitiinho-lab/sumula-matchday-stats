import { actions, points, roundPerformances, selectAward } from './performance';
import { careerAchievements, type CareerStats } from './profile-achievements';
import type { MatchPlayer, MatchRow } from './match-data';

export type HomeStat = Pick<MatchPlayer, keyof typeof import('./performance').WEIGHTS | 'presence' | 'final_team' | 'player_id'> & { match_id: string };
export type HomeRound = { match: MatchRow; players: MatchPlayer[] };
export function calendarDate(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}
export const roundDate = (m: MatchRow) => m.finished_at ?? m.scheduled_at ?? m.started_at;
export function inCurrentMonth(iso: string | null, now: Date) {
  return !!iso && calendarDate(iso).slice(0, 7) === calendarDate(now.toISOString()).slice(0, 7);
}
function weekStart(iso: string) {
  const date = new Date(`${calendarDate(iso)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.getTime();
}
export function consecutiveWeeks(dates: string[], now: Date) {
  const week = 7 * 86400000;
  const weeks = new Set(dates.filter(d => new Date(d) <= now).map(weekStart));
  let cursor = weekStart(now.toISOString());
  if (!weeks.has(cursor)) cursor -= week;
  let count = 0;
  while (weeks.has(cursor)) { count++; cursor -= week; }
  return count;
}
export function personalEvolution(stats: HomeStat[], matches: MatchRow[], mvps: number, now: Date) {
  const byId = new Map(matches.map(m => [m.id, m]));
  const completed = stats.flatMap(s => {
    const m = byId.get(s.match_id);
    return m?.status === 'finished' ? [{ stat: s, match: m, date: roundDate(m) }] : [];
  });
  const total = (key: 'goals' | 'assists' | 'saves' | 'difficult_saves' | 'tackles') => completed.reduce((n, r) => n + (r.stat[key] ?? 0), 0);
  const career: CareerStats = { games: completed.length, goals: total('goals'), assists: total('assists'), saves: total('saves') + total('difficult_saves'), tackles: total('tackles'), mvps };
  const nextAchievement = careerAchievements(career).filter(a => !a.unlocked).sort((a,b) => b.progress/b.target - a.progress/a.target)[0];
  const recent = completed.filter(r => r.date).sort((a,b) => (a.date ?? '').localeCompare(b.date ?? '')).slice(-5).map(r => ({ id: r.match.id, date: r.date ?? '', points: points(r.stat) }));
  const monthly = completed.filter(r => inCurrentMonth(r.date, now) && r.stat.presence === 'confirmed' && (r.stat.final_team === 'colete' || r.stat.final_team === 'sem_colete') && r.match.score_team_a !== null && r.match.score_team_b !== null);
  const wins = monthly.filter(r => r.stat.final_team === 'colete' ? (r.match.score_team_a ?? 0) > (r.match.score_team_b ?? 0) : (r.match.score_team_b ?? 0) > (r.match.score_team_a ?? 0)).length;
  const played = completed.filter(r => r.stat.final_team === 'colete' || r.stat.final_team === 'sem_colete' || actions(r.stat) > 0);
  return { recent, nextAchievement, monthlyGames: monthly.length, wins, winRate: monthly.length ? Math.round(wins / monthly.length * 100) : null, streak: consecutiveWeeks(played.flatMap(r => r.date ? [r.date] : []), now) };
}
export type GazetteStory = { id: string; kind: 'goals' | 'saves' | 'mvp'; name: string; value: number; matchId: string; tied: boolean };
export function gazetteStories(rounds: HomeRound[], now: Date): GazetteStory[] {
  const unique = [...new Map(rounds.map(r => [r.match.id, r])).values()].filter(r => r.match.status === 'finished' && inCurrentMonth(roundDate(r.match), now)).sort((a,b) => (roundDate(b.match) ?? '').localeCompare(roundDate(a.match) ?? ''));
  const totals = new Map<string, { name: string; goals: number; saves: number; matchId: string }>();
  for (const r of unique) for (const p of r.players) {
    const prev = totals.get(p.player_id);
    totals.set(p.player_id, { name: p.profile?.apelido || p.profile?.nome || 'Atleta', goals: (prev?.goals ?? 0) + (p.goals ?? 0), saves: (prev?.saves ?? 0) + (p.difficult_saves ?? 0), matchId: prev?.matchId ?? r.match.id });
  }
  const stories: GazetteStory[] = [];
  for (const kind of ['goals', 'saves'] as const) {
    const max = Math.max(0, ...[...totals.values()].map(p => p[kind]));
    const leaders = [...totals.entries()].filter(([, p]) => p[kind] === max);
    if (max > 0) for (const [id, p] of leaders) stories.push({ id: `${kind}-${id}`, kind, name: p.name, value: max, tied: leaders.length > 1, matchId: p.matchId });
  }
  const last = unique[0];
  if (last) {
    const award = selectAward(roundPerformances(last.players));
    const winner = award.status === 'winner' ? award.leaders[0] : undefined;
    if (winner) stories.unshift({ id: `mvp-${last.match.id}`, kind: 'mvp', name: winner.player.profile?.apelido || 'Atleta', value: winner.points, matchId: last.match.id, tied: false });
  }
  return stories;
}