import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Copy, Shuffle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Shell, Tag } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { drawTeams, modalityInfo, TEAM_LABEL, type Team } from "@/lib/draw";
import { loadMatch, type MatchPlayer } from "@/lib/match-data";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/lobby/$matchId")({
  head: () => ({
    meta: [
      { title: "Lobby da Pelada — Súmula FC" },
      { name: "description", content: "Entre na lista do racha e veja o sorteio dos times." },
      { property: "og:title", content: "Lobby da Pelada — Súmula FC" },
      { property: "og:description", content: "Entre na lista do racha e veja o sorteio dos times." },
    ],
  }),
  component: Lobby,
});

const ORDER: Team[] = ["colete", "sem_colete", "proxima_1", "proxima_2", "proxima_3", "unassigned"];

function Lobby() {
  const { matchId } = Route.useParams();
  const { user } = useSession();
  const [data, setData] = useState<Awaited<ReturnType<typeof loadMatch>> | null>(null);
  const refresh = useCallback(() => loadMatch(matchId).then(setData), [matchId]);
  useEffect(() => { refresh(); }, [refresh]);

  if (!data) return <Shell><p className="mt-10 text-muted-foreground">Carregando…</p></Shell>;
  if (!data.match) return <Shell><h1 className="mt-10 text-4xl">Racha não encontrado</h1></Shell>;

  const { match, players } = data;
  const info = modalityInfo(match.modality);
  const isCreator = user?.id === match.creator_id;
  const joined = players.some((p) => p.player_id === user?.id);
  const full = players.length >= info.max;
  const drawn = players.some((p) => p.team !== "unassigned");

  const join = async () => {
    const next = Math.max(0, ...players.map((p) => p.queue_position)) + 1;
    const { error } = await supabase.from("match_players").insert({ match_id: matchId, player_id: user!.id, queue_position: next });
    if (error) toast.error("Não foi possível entrar"); else refresh();
  };
  const leave = async () => {
    await supabase.from("match_players").delete().eq("match_id", matchId).eq("player_id", user!.id);
    refresh();
  };
  const draw = async () => {
    if (players.length < 2) return toast.error("Precisa de pelo menos 2 atletas");
    const res = drawTeams(players.map((p) => ({ id: p.player_id, queue: p.queue_position, overall: p.profile?.overall_rating ?? 70 })), info.size);
    await Promise.all(Object.entries(res).map(([pid, team]) =>
      supabase.from("match_players").update({ team }).eq("match_id", matchId).eq("player_id", pid)));
    toast.success("Times sorteados!");
    refresh();
  };
  const link = typeof window !== "undefined" ? `${window.location.origin}/lobby/${matchId}` : "";

  const avg = (t: Team) => {
    const l = players.filter((p) => p.team === t);
    return l.length ? Math.round(l.reduce((s, p) => s + (p.profile?.overall_rating ?? 70), 0) / l.length) : 0;
  };

  return (
    <Shell>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Tag>Lobby · {match.modality}</Tag>
          <h1 className="mt-3 text-5xl">{match.title || "Pelada da semana"}</h1>
          <p className="mt-1 text-muted-foreground">{players.length}/{info.max} atletas confirmados</p>
        </div>
        <button className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:border-primary"
          onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copiado"); }}>
          <Copy className="h-4 w-4" /> Copiar link do racha
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!user && <Link to="/auth" className="pill w-auto bg-primary text-primary-foreground">Entre para confirmar presença</Link>}
        {user && !joined && <button disabled={full} onClick={join} className="pill w-auto bg-primary text-primary-foreground disabled:opacity-50">{full ? "Lotado" : "Confirmar presença"}</button>}
        {user && joined && !isCreator && <button onClick={leave} className="pill w-auto border">Sair da lista</button>}
        {isCreator && <button onClick={draw} className="pill w-auto bg-primary text-primary-foreground"><Shuffle className="h-5 w-5" /> {drawn ? "Refazer sorteio" : "Sortear Times"}</button>}
        <Link to="/match/summary/$matchId" params={{ matchId }} className="pill w-auto bg-secondary"><Trophy className="h-5 w-5 text-primary" /> Súmula & Resenha</Link>
      </div>

      {drawn ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ORDER.map((t) => {
            const list = players.filter((p) => p.team === t);
            if (!list.length) return null;
            const starter = t === "colete" || t === "sem_colete";
            return (
              <div key={t} className={`rounded-2xl p-5 ${t === "colete" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl">{TEAM_LABEL[t]}</h2>
                  {starter && <span className="text-sm font-bold opacity-80">Média {avg(t)}</span>}
                </div>
                <PlayerList list={list} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-card p-5">
          <h2 className="text-2xl">Ordem de chegada</h2>
          <PlayerList list={players} />
        </div>
      )}
    </Shell>
  );
}

function PlayerList({ list }: { list: MatchPlayer[] }) {
  return (
    <ol className="mt-3 flex flex-col gap-1.5">
      {list.map((p) => (
        <li key={p.player_id} className="flex items-center gap-3 text-sm">
          <span className="w-7 font-display text-lg opacity-60">{p.queue_position}</span>
          <span className="flex-1 font-semibold">{p.profile?.apelido ?? "Atleta"}</span>
          <span className="font-display text-lg">{p.profile?.overall_rating ?? 70}</span>
        </li>
      ))}
    </ol>
  );
}
