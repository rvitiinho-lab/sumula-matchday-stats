import { Link } from '@tanstack/react-router';
import { ChevronRight, Trophy } from 'lucide-react';
import { Avatar } from '@/components/AppShell';
import { formatCompetitiveScore, type RankingPlayer } from '@/hooks/useCompetitiveRanking';
export function RankingCard({ player, own }: { player: RankingPlayer; own: boolean }) {
  return <Link to="/athlete/$playerId" params={{ playerId: player.id }} aria-label={`Ver perfil de ${player.nickname}`} className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b py-5 sm:grid-cols-[2rem_1fr_6rem_4rem_4rem_1rem] ${own ? 'bg-primary/5' : 'hover:bg-accent/30'}`}>
    <span className={`text-center font-display text-2xl ${player.position === 1 ? 'text-primary' : 'text-muted-foreground'}`}>{player.position}</span>
    <div className="flex min-w-0 items-center gap-3"><Avatar name={player.nickname}/><div className="min-w-0"><p className="break-words text-sm font-extrabold">{player.nickname}{own && <span className="ml-2 text-[10px] text-primary">VOCÊ</span>}</p><p className="mt-1 truncate text-xs text-muted-foreground">{player.name}</p><p className="mt-2 text-[10px] text-muted-foreground sm:hidden">OVR {player.overall ?? '—'} · {player.mvps} MVPs</p></div></div>
    <div className="text-right"><p className="font-display text-3xl text-primary">{formatCompetitiveScore(player.score)}</p><p className="text-[10px] text-muted-foreground sm:hidden">PONTOS</p></div><span className="hidden text-right font-bold sm:block">{player.overall ?? '—'}</span><span className="hidden items-center justify-end gap-1 text-sm sm:flex"><Trophy className="size-3 text-muted-foreground"/>{player.mvps}</span><ChevronRight className="hidden size-4 text-muted-foreground sm:block"/>
  </Link>;
}