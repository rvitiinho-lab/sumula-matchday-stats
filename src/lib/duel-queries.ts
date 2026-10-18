import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export const duelsQuery = () => queryOptions({ queryKey: ['duels'], refetchInterval: 3000, queryFn: async () => {
  const { data, error } = await supabase.from('duels').select('*, home:profiles!duels_creator_id_fkey(*), away:profiles!duels_opponent_id_fkey(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
} });
export const duelQuery = (id: string) => queryOptions({ queryKey: ['duel', id], refetchInterval: 3000, queryFn: async () => {
  const { data, error } = await supabase.from('duels').select('*, home:profiles!duels_creator_id_fkey(*), away:profiles!duels_opponent_id_fkey(*)').eq('id', id).single();
  if (error) throw error;
  return data;
} });
export const duelOpponentsQuery = () => queryOptions({ queryKey: ['duel-opponents'], queryFn: async () => {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user.user) throw new Error('Entre para escolher seu adversário.');
  const { data, error } = await supabase.from('player_follows').select('player:profiles!player_follows_player_id_fkey(*)').eq('follower_id', user.user.id);
  if (error) throw error;
  return (data ?? []).flatMap(row => row.player ? [row.player] : []);
} });