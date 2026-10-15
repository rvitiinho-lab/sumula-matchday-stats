import { describe, expect, it } from 'vitest';
import { consecutiveWeeks, gazetteStories, personalEvolution } from './home-insights';
import type { MatchPlayer, MatchRow } from './match-data';
const now = new Date('2026-10-15T14:00:00Z');
const match = (id: string, date = '2026-10-14T14:00:00Z', extra: Partial<MatchRow> = {}): MatchRow => ({ id, status: 'finished', finished_at: date, score_team_a: 2, score_team_b: 1, ...extra } as MatchRow);
const player = (id: string, extra: Partial<MatchPlayer> = {}): MatchPlayer => ({ player_id: id, presence: 'confirmed', final_team: 'colete', goals: 0, assists: 0, tackles: 0, saves: 0, difficult_saves: 0, shots_on_goal: 0, fouls_suffered: 0, fouls_committed: 0, victory_points: 0, ...extra } as MatchPlayer);
describe('Home insights', () => {
  it('counts consecutive completed weeks, not wins or multiple rounds', () => {
    expect(consecutiveWeeks(['2026-10-14T14:00:00Z','2026-10-13T14:00:00Z','2026-10-07T14:00:00Z','2026-09-30T14:00:00Z'], now)).toBe(3);
    expect(consecutiveWeeks(['2026-09-30T14:00:00Z'], now)).toBe(0);
  });
  it('shows exactly the last five existing performance totals', () => {
    const matches = Array.from({length: 6}, (_,i) => match(String(i), `2026-10-0${i+1}T14:00:00Z`));
    const stats = matches.map((m,i) => ({ ...player('me', { goals: i }), match_id: m.id }));
    expect(personalEvolution(stats, matches, 0, now).recent.map(r => r.points)).toEqual([5,10,15,20,25]);
  });
  it('monthly win rate excludes earlier months, reserves and unfinished games', () => {
    const matches = [match('win'), match('loss',undefined,{score_team_a:0,score_team_b:1}), match('old','2026-09-10T14:00:00Z'),match('queue'),match('open',undefined,{status:'open'})];
    const stats = matches.map(m => ({...player('me',m.id==='queue'?{final_team:null}:{}), match_id:m.id}));
    const result = personalEvolution(stats,matches,0,now);
    expect(result.monthlyGames).toBe(2); expect(result.winRate).toBe(50);
  });
  it('only completed participation counts toward streak', () => {
    const m = match('open',undefined,{status:'open'});
    expect(personalEvolution([{...player('me'),match_id:m.id}],[m],0,now).streak).toBe(0);
  });
  it('confirmed reserves without recorded participation do not extend the streak', () => {
    const m=match('reserve');
    expect(personalEvolution([{...player('me',{final_team:null}),match_id:m.id}],[m],0,now).streak).toBe(0);
  });
  it('uses existing achievement targets', () => {
    const m=match('one'); const result=personalEvolution([{...player('me'),match_id:m.id}],[m],0,now);
    expect(result.nextAchievement?.id).toBe('regular'); expect(result.nextAchievement?.target).toBe(5); expect(result.nextAchievement?.progress).toBe(1);
  });
  it('gazette sums current month once and reports ties instead of isolated leaders', () => {
    const r={match:match('m'),players:[player('a',{goals:2}),player('b',{goals:2})]};
    const stories=gazetteStories([r,r,{match:match('old','2026-09-10T14:00:00Z'),players:[player('c',{goals:100})]}],now);
    expect(stories.filter(s=>s.kind==='goals').map(s=>[s.value,s.tied])).toEqual([[2,true],[2,true]]);
    expect(stories.some(s=>s.kind==='mvp')).toBe(false);
  });
  it('does not invent difficult saves or an MVP with insufficient data', () => {
    const stories=gazetteStories([{match:match('m'),players:[player('a',{goals:2,saves:10})]}],now);
    expect(stories.map(s=>s.kind)).toEqual(['goals']);
  });
  it('shows the existing automatically selected MVP', () => {
    const stories=gazetteStories([{match:match('m'),players:[player('a',{goals:2}),player('b',{assists:1})]}],now);
    expect(stories.find(s=>s.kind==='mvp')?.value).toBe(10);
  });
});