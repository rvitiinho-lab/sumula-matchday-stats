import { supabase } from "@/integrations/supabase/client";
import type { Team } from "./draw";

export interface MatchPlayer {
  player_id: string;
  queue_position: number;
  arrival_order?: number | null;
  queue_status?: string;
  queue_index?: number | null;
  team: Team;
  presence: string;
  goals: number;
  assists: number;
  tackles: number;
  shots_on_goal: number;
  fouls_suffered: number;
  fouls_committed: number;
  saves: number;
  profile: { nome: string; apelido: string; overall_rating: number; quote: string | null; position: string } | null;
}

export type EventType = "goal" | "assist" | "tackle" | "shot_on_goal" | "foul_suffered" | "foul_committed" | "save";
export const EVENT_COLUMN: Record<EventType, keyof MatchPlayer & string> = {
  goal: "goals", assist: "assists", tackle: "tackles", shot_on_goal: "shots_on_goal",
  foul_suffered: "fouls_suffered", foul_committed: "fouls_committed", save: "saves",
};
export const EVENT_LABEL: Record<EventType, string> = {
  goal: "Gol", assist: "Assistência", tackle: "Desarme", shot_on_goal: "Chute no gol",
  foul_suffered: "Falta sofrida", foul_committed: "Falta cometida", save: "Defesa",
};

export const POSITIONS = ["GOL", "ZAG", "LAT", "VOL", "MEI", "ATA"] as const;

const PLAYER_COLS =
  "player_id, queue_position, arrival_order, queue_status, queue_index, team, presence, goals, assists, tackles, shots_on_goal, fouls_suffered, fouls_committed, saves, profile:profiles(nome, apelido, overall_rating, quote, position)";

export async function loadMatch(id: string) {
  const [matchResponse, playersResponse] = await Promise.all([
    supabase.from("matches").select("*").eq("id", id).maybeSingle(),
    supabase.from("match_players").select(PLAYER_COLS).eq("match_id", id).order("arrival_order"),
  ]);
  if (matchResponse.error) throw matchResponse.error;
  if (playersResponse.error) throw playersResponse.error;
  return { match: matchResponse.data, players: (playersResponse.data ?? []).map(p => ({ ...p, team: p.team ?? "unassigned", goals: p.goals ?? 0, assists: p.assists ?? 0 })) as unknown as MatchPlayer[] };
}

export type MatchRow = NonNullable<Awaited<ReturnType<typeof loadMatch>>["match"]>;

/** All matches the user created or is listed in, newest first. */
export async function loadMyMatches(uid: string): Promise<MatchRow[]> {
  const { data: mine, error: mineError } = await supabase.from("match_players").select("match_id").eq("player_id", uid);
  if (mineError) throw mineError;
  const ids = (mine ?? []).map((r) => r.match_id);
  const filter = ids.length ? `creator_id.eq.${uid},id.in.(${ids.join(",")})` : `creator_id.eq.${uid}`;
  const { data, error } = await supabase.from("matches").select("*").or(filter).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const isStarter = (t: string) => t === "colete" || t === "sem_colete";

export function fmtDate(iso: string | null) {
  if (!iso) return "Data a definir";
  return new Date(iso).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export async function shareLink(url: string, title: string) {
  if (navigator.share) { try { await navigator.share({ title, url }); return true; } catch { return false; } }
  await navigator.clipboard.writeText(url);
  return true;
}
