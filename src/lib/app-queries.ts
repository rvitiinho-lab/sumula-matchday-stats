import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loadMatch, loadMyMatches } from "./match-data";
import { roundPerformances, selectAward } from "./performance";
export const matchQuery = (id: string) => queryOptions({ queryKey: ["match", id], queryFn: () => loadMatch(id) });
export const accountQuery = () => queryOptions({ queryKey: ["account"], queryFn: async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Entre na sua conta para continuar.");
  const userId = data.user.id;
  const [profile, matches, stats] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", data.user.id).single(),
    loadMyMatches(data.user.id),
    supabase.from("match_players").select("*, match:matches(status)").eq("player_id", data.user.id),
  ]);
  if (profile.error) throw profile.error;
  if (stats.error) throw stats.error;
  const finishedIds = (stats.data ?? []).filter(s => s.match?.status === "finished").map(s => s.match_id);
  const rounds = await Promise.all(finishedIds.map(id => loadMatch(id)));
  const mvps = rounds.reduce((total, round) => { const award = selectAward(roundPerformances(round.players)); return total + (award.status === "winner" && award.leaders[0]?.player.player_id === userId ? 1 : 0); }, 0);
  return { user: { id: data.user.id, email: data.user.email }, profile: profile.data, matches, stats: stats.data ?? [], mvps };
} });
export const peladaQuery = (id: string) => queryOptions({ queryKey: ["pelada", id], refetchInterval: 3000, queryFn: async () => {
  const current = await loadMatch(id);
  if (!current.match) return { root: id, closed: false, rounds: [], messages: [] };
  const root = current.match.pelada_id ?? current.match.id;
  const [matches, messages] = await Promise.all([
    supabase.from("matches").select("*").or(`id.eq.${root},pelada_id.eq.${root}`).order("round_number"),
    supabase.from("pelada_messages").select("*").eq("pelada_id", root),
  ]);
  if (matches.error) throw matches.error;
  if (messages.error) throw messages.error;
  const loaded = await Promise.all((matches.data ?? []).map(m => loadMatch(m.id)));
  const rounds = loaded.flatMap(r => r.match ? [{ match: r.match, players: r.players }] : []);
  return { root, closed: matches.data?.find(m => m.id === root)?.pelada_closed ?? false, rounds, messages: messages.data ?? [] };
} });
