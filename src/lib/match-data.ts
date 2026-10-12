import { supabase } from "@/integrations/supabase/client";
import type { Team } from "./draw";

export interface MatchPlayer {
  player_id: string;
  queue_position: number;
  team: Team;
  goals: number;
  assists: number;
  profile: { nome: string; apelido: string; overall_rating: number; quote: string | null } | null;
}

export async function loadMatch(id: string) {
  const [{ data: match }, { data: players }] = await Promise.all([
    supabase.from("matches").select("*").eq("id", id).maybeSingle(),
    supabase.from("match_players")
      .select("player_id, queue_position, team, goals, assists, profile:profiles(nome, apelido, overall_rating, quote)")
      .eq("match_id", id).order("queue_position"),
  ]);
  return { match, players: (players ?? []) as unknown as MatchPlayer[] };
}
