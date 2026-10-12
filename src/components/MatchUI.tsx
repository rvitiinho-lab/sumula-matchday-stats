import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { CalendarDays, MapPin, ArrowUpRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtDate, type MatchRow } from "@/lib/match-data";
export function MatchTile({ match }: { match: MatchRow }) {
  return <Link to="/lobby/$matchId" params={{ matchId: match.id }} className="flex items-center justify-between gap-4 border-b py-5">
    <div className="min-w-0"><p className="text-xs font-bold text-muted-foreground">{match.modality} · {match.status === "finished" ? "Encerrada" : match.status === "in_progress" ? "Ao vivo" : "Confirmando presença"}</p><h3 className="mt-1 text-xl break-words">{match.title || "Pelada da semana"}</h3><p className="mt-1 text-xs text-muted-foreground">{fmtDate(match.scheduled_at)}</p></div>
    {match.status === "finished" ? <span className="shrink-0 font-display text-3xl">{match.score_team_a ?? 0} × {match.score_team_b ?? 0}</span> : <ArrowUpRight className="shrink-0" />}
  </Link>;
}
export function MatchDetails({ match }: { match: MatchRow }) { return <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><span className="flex items-center gap-2"><CalendarDays className="size-4" />{fmtDate(match.scheduled_at)}</span><span className="flex items-center gap-2"><MapPin className="size-4" />{match.location || "Local a definir"}</span></div>; }
export function Scoreboard({ match, live = false, time }: { match: MatchRow; live?: boolean; time?: string }) {
  return <section className="rounded-lg bg-ink px-4 py-7 text-center text-ink-foreground"><p className="text-xs font-extrabold uppercase text-primary">{live ? "● Partida ao vivo" : "Súmula digital"}{time && ` · ${time}`}</p><div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div><p className="sport-score text-primary">{match.score_team_a ?? 0}</p><h2 className="mt-3 text-lg">Colete</h2></div><span className="font-display text-3xl opacity-40">×</span><div><p className="sport-score">{match.score_team_b ?? 0}</p><h2 className="mt-3 text-lg">Sem colete</h2></div></div></section>;
}
export function PageError({ error }: ErrorComponentProps) { const router = useRouter(); return <div className="theme-cream min-h-screen px-5 py-12 text-center" role="alert"><Trophy className="mx-auto mb-4 size-10"/><h1 className="text-3xl">Não foi possível carregar</h1><p className="my-4">{error instanceof Error ? error.message : "Tente novamente em instantes."}</p><Button onClick={() => router.invalidate()}>Tentar novamente</Button></div>; }
export function PageMissing() { return <div className="theme-cream min-h-screen p-10"><h1 className="text-3xl">Pelada não encontrada</h1><Button asChild className="mt-5"><Link to="/home">Voltar ao início</Link></Button></div>; }
