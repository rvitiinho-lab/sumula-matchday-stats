import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loadMatch, loadMyMatches } from "./match-data";
export const matchQuery = (id: string) => queryOptions({ queryKey: ["match", id], queryFn: () => loadMatch(id) });
export const accountQuery = () => queryOptions({ queryKey: ["account"], queryFn: async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Entre na sua conta para continuar.");
  const [profile, matches, stats] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", data.user.id).single(),
    loadMyMatches(data.user.id),
    supabase.from("match_players").select("*, match:matches(status)").eq("player_id", data.user.id),
  ]);
  if (profile.error) throw profile.error;
  if (stats.error) throw stats.error;
  return { user: { id: data.user.id, email: data.user.email }, profile: profile.data, matches, stats: stats.data ?? [] };
} });
export const reviewQuery = (id: string) => queryOptions({ queryKey: ["review", id], queryFn: async () => {
  const [ratings, votes, results, progress] = await Promise.all([
    supabase.from("match_ratings").select("*").eq("match_id", id),
    supabase.from("match_votes").select("*").eq("match_id", id),
    supabase.rpc("match_results", { _match: id }),
    supabase.rpc("match_voting_progress", { _match: id }),
  ]);
  for (const response of [ratings, votes, results, progress]) if (response.error) throw response.error;
  return { ratings: ratings.data ?? [], votes: votes.data ?? [], results: results.data ?? [], progress: progress.data?.[0] };
} });
