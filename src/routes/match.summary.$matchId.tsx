import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Shell, Tag } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { loadMatch, type MatchPlayer } from "@/lib/match-data";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/match/summary/$matchId")({
  head: () => ({
    meta: [
      { title: "Súmula & Resenha — Súmula FC" },
      { name: "description", content: "Placar, gols, assistências e os cards da resenha da pelada." },
      { property: "og:title", content: "Súmula & Resenha — Súmula FC" },
      { property: "og:description", content: "Placar, gols, assistências e os cards da resenha da pelada." },
    ],
  }),
  component: Summary,
});

const BADGES = ["Craque", "Garçom", "Matador", "Muralha", "Raçudo", "Resenha"];

function Summary() {
  const { matchId } = Route.useParams();
  const { user } = useSession();
  const [data, setData] = useState<Awaited<ReturnType<typeof loadMatch>> | null>(null);
  const refresh = useCallback(() => loadMatch(matchId).then(setData), [matchId]);
  useEffect(() => { refresh(); }, [refresh]);

  if (!data) return <Shell><p className="mt-10 text-muted-foreground">Carregando…</p></Shell>;
  if (!data.match) return <Shell><h1 className="mt-10 text-4xl">Partida não encontrada</h1></Shell>;
  const { match, players } = data;
  const isCreator = user?.id === match.creator_id;

  const setScore = async (field: "score_team_a" | "score_team_b", d: number) => {
    await supabase.from("matches").update({ [field]: Math.max(0, (match[field] ?? 0) + d), status: "in_progress" } as { score_team_a?: number; status: string }).eq("id", matchId);
    refresh();
  };
  const setStat = async (p: MatchPlayer, field: "goals" | "assists", d: number) => {
    await supabase.from("match_players").update({ [field]: Math.max(0, p[field] + d) } as { goals?: number }).eq("match_id", matchId).eq("player_id", p.player_id);
    refresh();
  };

  const ranked = [...players]
    .filter((p) => p.team === "colete" || p.team === "sem_colete")
    .sort((a, b) => b.goals * 2 + b.assists - (a.goals * 2 + a.assists) || (b.profile?.overall_rating ?? 0) - (a.profile?.overall_rating ?? 0));

  return (
    <Shell>
      <Link to="/lobby/$matchId" params={{ matchId }} className="text-sm text-muted-foreground hover:text-primary">← Voltar ao lobby</Link>
      <section className="mt-4 rounded-3xl bg-card p-8 text-center">
        <Tag>Súmula digital · {match.modality}</Tag>
        <div className="mt-6 flex items-center justify-center gap-4 sm:gap-10">
          <ScoreSide label="Colete" value={match.score_team_a ?? 0} edit={isCreator} onChange={(d) => setScore("score_team_a", d)} highlight />
          <span className="font-display text-5xl text-muted-foreground">x</span>
          <ScoreSide label="Sem Colete" value={match.score_team_b ?? 0} edit={isCreator} onChange={(d) => setScore("score_team_b", d)} />
        </div>
      </section>

      <h2 className="mt-12 text-4xl">Cards da <span className="text-primary">Resenha</span></h2>
      {ranked.length === 0 && <p className="mt-3 text-muted-foreground">Sorteie os times no lobby para gerar os cards.</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((p, i) => (
          <article key={p.player_id} className="relative overflow-hidden rounded-3xl bg-cream p-6 text-cream-foreground">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-6xl leading-none">{p.profile?.overall_rating ?? 70}</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-cream-muted">{p.team === "colete" ? "Colete" : "Sem Colete"}</p>
              </div>
              <span className="rounded-full bg-cream-foreground px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                Súmula FC · {BADGES[Math.min(i, BADGES.length - 1)]}
              </span>
            </div>
            <h3 className="mt-6 text-3xl">{p.profile?.apelido ?? "Atleta"}</h3>
            <p className="text-sm text-cream-muted">{p.profile?.nome}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-foreground/15 pt-4">
              <Stat label="Gols" value={p.goals} edit={isCreator} onChange={(d) => setStat(p, "goals", d)} />
              <Stat label="Assist." value={p.assists} edit={isCreator} onChange={(d) => setStat(p, "assists", d)} />
            </div>
            <blockquote className="mt-4 rounded-2xl rounded-bl-sm bg-cream-foreground px-4 py-3 text-sm italic text-foreground">
              “{p.profile?.quote || "Hoje a bola veio redonda."}”
            </blockquote>
          </article>
        ))}
      </div>
    </Shell>
  );
}

function ScoreSide({ label, value, edit, onChange, highlight }: { label: string; value: number; edit: boolean; onChange: (d: number) => void; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`font-display text-8xl leading-none sm:text-9xl ${highlight ? "text-primary" : ""}`}>{value}</span>
      <span className="mt-2 text-sm font-extrabold uppercase tracking-widest">{label}</span>
      {edit && (
        <div className="mt-3 flex gap-2">
          <button aria-label={`Diminuir ${label}`} onClick={() => onChange(-1)} className="rounded-full border p-2"><Minus className="h-4 w-4" /></button>
          <button aria-label={`Aumentar ${label}`} onClick={() => onChange(1)} className="rounded-full bg-primary p-2 text-primary-foreground"><Plus className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, edit, onChange }: { label: string; value: number; edit: boolean; onChange: (d: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <p className="font-display text-3xl leading-none">{value}</p>
        <p className="text-xs font-bold uppercase text-cream-muted">{label}</p>
      </div>
      {edit && (
        <div className="flex flex-col gap-1">
          <button aria-label={`Mais ${label}`} onClick={() => onChange(1)} className="rounded-full bg-cream-foreground p-1 text-primary"><Plus className="h-3 w-3" /></button>
          <button aria-label={`Menos ${label}`} onClick={() => onChange(-1)} className="rounded-full border border-cream-foreground/30 p-1"><Minus className="h-3 w-3" /></button>
        </div>
      )}
    </div>
  );
}
