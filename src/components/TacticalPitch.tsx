import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronUp, LogOut, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, OvrBadge } from "./AppShell";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "./ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { arrival, waitingTeams } from "@/lib/fifo";
import { modalityInfo } from "@/lib/draw";
import type { MatchPlayer, MatchRow } from "@/lib/match-data";

const positions = ["GOL", "ZAG", "LAT", "VOL", "MEI", "ATA"];
export function TacticalPitch({ match, players, userId, onPlayer }: { match: MatchRow; players: MatchPlayer[]; userId?: string | undefined; onPlayer?: (p: MatchPlayer) => void }) {
  const {operate} = useUserRole(match);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const size = modalityInfo(match.modality).size;
  const confirmed = players.filter(p => p.presence === "confirmed");
  const waiting = waitingTeams(players, size);
  const creator = userId === match.creator_id;
  const editable = match.status === "open" || match.status === "in_progress";
  const remove = async (p: MatchPlayer) => {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.rpc("remove_match_player", { _match: match.id, _player: p.player_id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await Promise.all([qc.invalidateQueries({ queryKey: ["match", match.id] }), qc.invalidateQueries({ queryKey: ["account"] })]);
    toast.success("Saída registrada. Fila atualizada!");
  };
  const card = (p: MatchPlayer, field = false) => <article key={p.player_id} data-player-id={p.player_id} className={field ? "pitch-player" : "flex items-center gap-3 border-b py-3"}>
    {field ? <><Avatar name={p.profile?.apelido || "Atleta"} size={32}/><p className="w-full break-words text-center text-xs font-extrabold leading-tight">{p.profile?.apelido || "Atleta"}</p><div className="flex items-center gap-1"><span className="text-[10px]">{p.profile?.position || "MEI"}</span><OvrBadge value={p.profile?.overall_rating ?? 70} className="min-w-6 text-sm"/></div></> : <><span className="w-6 text-xs text-muted-foreground">{waiting.queued.findIndex(q => q.player_id === p.player_id) + 1}</span><Avatar name={p.profile?.apelido || "Atleta"}/><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold">{p.profile?.apelido}</p><p className="text-xs text-muted-foreground">{p.profile?.position} · chegada {arrival(p)}</p></div><OvrBadge value={p.profile?.overall_rating ?? 70}/></>}
    {field && onPlayer && operate && match.status === "in_progress" && <Button variant="secondary" size="sm" className="h-6 w-full px-1 text-[10px]" onClick={() => onPlayer(p)} aria-label={`Registrar lance de ${p.profile?.apelido}`}>Lance</Button>}
    {editable && (creator || p.player_id === userId) && <Button variant="ghost" size={field ? "sm" : "icon"} className={field ? "h-6 w-full gap-1 px-1 text-[10px]" : "shrink-0"} disabled={busy} onClick={() => remove(p)} title={p.player_id === userId ? "Sair do jogo" : "Remover atleta"} aria-label={`${p.player_id === userId ? "Sair do jogo" : "Remover"} ${p.profile?.apelido}`}>
      {p.player_id === userId ? <LogOut className="size-3"/> : <X className="size-3"/>}{field && (p.player_id === userId ? "Sair" : "Remover")}
    </Button>}
  </article>;
  return <section className="mt-7" aria-label="Prancheta tática">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><h2 className="text-xl">Prancheta tática</h2><span className="text-xs font-bold text-muted-foreground">{confirmed.filter(p => p.team === "colete" || p.team === "sem_colete").length}/{size * 2} em campo</span></div>
    <div className="tactical-pitch">
      <div className="pitch-lines" aria-hidden="true"><div className="pitch-center"/><div className="pitch-box pitch-box-top"/><div className="pitch-box pitch-box-bottom"/></div>
      {(["colete", "sem_colete"] as const).map((team, index) => {
        const list = confirmed.filter(p => p.team === team).sort((a, b) => positions.indexOf(a.profile?.position || "MEI") - positions.indexOf(b.profile?.position || "MEI") || arrival(a) - arrival(b));
        return <div className={`pitch-half ${index === 0 ? "pitch-team-a" : "pitch-team-b"}`} key={team} aria-label={`Time ${index === 0 ? "A" : "B"}`}><div className="flex items-center justify-between gap-2 px-1"><h3 className="text-sm">Time {index === 0 ? "A · Colete" : "B · Sem colete"}</h3><span className="text-xs">{list.length}/{size}</span></div><div className="pitch-formation">{list.map(p => card(p, true))}{list.length === 0 && <p className="col-span-full py-8 text-center text-xs">Aguardando atletas</p>}</div></div>;
      })}
    </div>
    <Drawer shouldScaleBackground={false}><DrawerTrigger asChild><Button variant="secondary" className="sport-action mt-3 w-full justify-between"><Users/><span>Próximas Partidas · {waiting.queued.length}</span><ChevronUp/></Button></DrawerTrigger><DrawerContent className="theme-cream max-h-[85dvh]"><DrawerHeader className="mx-auto w-full max-w-3xl"><DrawerTitle className="font-display text-2xl uppercase">Próximas Partidas</DrawerTitle><DrawerDescription>{waiting.teams.length} times completos · {waiting.reserves.length} reservas individuais</DrawerDescription></DrawerHeader><div className="mx-auto w-full max-w-3xl overflow-y-auto px-5 pb-8">
      {waiting.teams.map((team, i) => <section key={i} className="mb-5"><h3 className="border-b bg-ink px-3 py-3 text-lg text-ink-foreground">Time {String.fromCharCode(67 + i)} · Próximo {i + 1} <span className="float-right text-sm">{size}/{size}</span></h3>{team.map(p => card(p))}</section>)}
      {waiting.reserves.length > 0 && <section><h3 className="border-b py-3 text-lg">Reservas individuais · {waiting.reserves.length}/{size}</h3>{waiting.reserves.map(p => card(p))}</section>}
      {!waiting.queued.length && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum atleta na fila.</p>}
    </div></DrawerContent></Drawer>
  </section>;
}