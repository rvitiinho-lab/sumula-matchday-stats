export const duelStats = ['goals', 'assists', 'tackles', 'saves'] as const;
export const statLabels = { goals: 'Gols', assists: 'Assistências', tackles: 'Desarmes', saves: 'Defesas' };
export type DuelStats = Record<typeof duelStats[number], number>;
export type DuelStatistics = { home: DuelStats; away: DuelStats };
export type DuelStatus = 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'DISPUTED' | 'FINISHED';
export const statusLabels: Record<string, string> = { IN_PROGRESS: 'Bola rolando', PENDING_APPROVAL: 'Aguardando confirmação', DISPUTED: 'Correção solicitada', FINISHED: 'Confirmado pelos atletas' };
export function readStatistics(value: unknown): DuelStatistics {
  const fallback = () => ({ goals: 0, assists: 0, tackles: 0, saves: 0 });
  if (!value || typeof value !== 'object') return { home: fallback(), away: fallback() };
  const record = value as Record<string, unknown>;
  const side = (key: string) => {
    const raw = record[key] as Partial<DuelStats> | undefined;
    return Object.fromEntries(duelStats.map(stat => [stat, typeof raw?.[stat] === 'number' ? raw[stat] : 0])) as DuelStats;
  };
  return { home: side('home'), away: side('away') };
}
export function canEditDuel(status: string, creator: boolean) { return creator && (status === 'IN_PROGRESS' || status === 'DISPUTED'); }
export function canConfirmDuel(status: string, opponent: boolean) { return opponent && status === 'PENDING_APPROVAL'; }
export function isFinalDuel(status: string, revision: number, confirmed: number | null) { return status === 'FINISHED' && confirmed === revision; }
export function validStatistics(stats: DuelStatistics) { return [stats.home, stats.away].every(side => duelStats.every(key => Number.isInteger(side[key]) && side[key] >= 0 && side[key] <= 1000)); }