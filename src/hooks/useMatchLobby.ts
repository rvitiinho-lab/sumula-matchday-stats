import { useEffect } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { matchQuery } from '@/lib/app-queries';
import { supabase } from '@/integrations/supabase/client';
export function useMatchLobby(matchId:string) {
  const qc=useQueryClient();
  const query=useSuspenseQuery({...matchQuery(matchId),refetchInterval:5000});
  useEffect(()=>{const refresh=()=>{void qc.invalidateQueries({queryKey:['match',matchId]});}; const channel=supabase.channel(`lobby-${matchId}`).on('postgres_changes',{event:'*',schema:'public',table:'match_players',filter:`match_id=eq.${matchId}`},refresh).on('postgres_changes',{event:'UPDATE',schema:'public',table:'matches',filter:`id=eq.${matchId}`},refresh).subscribe();return()=>{void supabase.removeChannel(channel);};},[matchId,qc]);
  return query;
}