import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type RankingScope = { type: 'global' } | { type: 'friends' } | { type: 'regional'; region: string } | { type: 'season'; season: string };
export type RankingPlayer = { id: string; name: string; nickname: string; role: string; quote: string | null; overall: number | null; mvps: number; peladas: number; valid_rounds: number; score: number | null; individual: number | null; wins: number | null; position: number | null; games: number; goals: number; assists: number; tackles: number; saves: number };
export type RankingData = { players: RankingPlayer[]; excluded: { id: string; title: string; round: number; reason: string }[]; minimum_peladas: number; minimum_seconds: number; updated_at: string; userId: string };
export const competitiveRankingQuery = (scope: RankingScope = { type: 'global' }) => queryOptions({
  queryKey: ['competitive-ranking', scope],
  staleTime: 15_000,
  refetchInterval: 30_000,
  queryFn: async (): Promise<RankingData> => {
    if (scope.type !== 'global') throw new Error('Este ranking ainda não está disponível.');
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Entre para consultar o ranking.');
    const { data, error } = await supabase.rpc('competitive_ranking');
    if (error) throw new Error('Não foi possível carregar o ranking. Tente novamente.');
    if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data['players']) || !Array.isArray(data['excluded'])) throw new Error('Resposta do ranking inválida.');
    return { ...(data as unknown as Omit<RankingData, 'userId'>), userId: auth.user.id };
  },
});
export function useCompetitiveRanking() { return useSuspenseQuery(competitiveRankingQuery()); }
export const formatCompetitiveScore = (score: number | null) => score === null ? '—' : score.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });