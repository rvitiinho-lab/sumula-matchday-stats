import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fmtPoints } from '@/lib/performance';
import type { personalEvolution } from '@/lib/home-insights';

export function UserEvolutionWidget({ evolution }: { evolution: ReturnType<typeof personalEvolution> }) {
  const { recent, nextAchievement, winRate, monthlyGames, wins } = evolution;
  const values = recent.map(r => r.points), min = Math.min(0, ...values), max = Math.max(1, ...values);
  const coordinates = values.map((v,i) => `${values.length === 1 ? 150 : 12 + i * 276 / (values.length - 1)},${82 - (v-min) / (max-min) * 65}`);
  return <section className="mt-8 border-y py-6" aria-labelledby="evolution-title">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase text-primary">Seu jogo em movimento</p><h2 id="evolution-title" className="mt-1 text-2xl">Acompanhe sua evolução</h2></div><TrendingUp className="mt-2 size-5 shrink-0 text-primary"/></div>
    <div className="mt-5 grid gap-5 sm:grid-cols-[1.5fr_1fr]">
      <div className="min-w-0"><div className="flex items-baseline justify-between gap-3"><p className="text-xs text-muted-foreground">Últimas {recent.length || 5} partidas</p><span className="text-xs font-bold">{recent.length ? `${fmtPoints(recent.at(-1)?.points ?? 0)} pts` : '—'}</span></div>
        {recent.length ? <><svg viewBox="0 0 300 100" className="mt-2 h-28 w-full overflow-visible" role="img" aria-label={`Pontos de desempenho: ${values.map(fmtPoints).join(', ')}`}><path d="M12 90H288" className="stroke-border" fill="none"/>{values.length > 1 && <polyline points={coordinates.join(' ')} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round"/>}{coordinates.map((c,i) => { const [cx,cy] = c.split(','); return <circle key={recent[i]?.id ?? i} cx={cx} cy={cy} r="4" className="fill-primary"><title>{fmtPoints(values[i] ?? 0)} pontos</title></circle>; })}</svg><div className="flex justify-between text-[10px] text-muted-foreground">{recent.map(r => <span key={r.id}>{new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })}<span className="mt-1 block font-bold text-foreground">{fmtPoints(r.points)} pts</span></span>)}</div></> : <p className="flex h-36 items-center text-sm text-muted-foreground">Sua evolução começa no primeiro apito final.</p>}
      </div>
      <div className="border-t pt-4 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0"><p className="text-xs text-muted-foreground">Vitórias no mês</p><p className="mt-2 font-display text-4xl text-primary">{winRate === null ? '—' : `${winRate}%`}</p><p className="mt-2 text-xs text-muted-foreground">{monthlyGames ? `${wins} ${wins === 1 ? 'vitória' : 'vitórias'} em ${monthlyGames} ${monthlyGames === 1 ? 'jogo' : 'jogos'}` : 'Nenhum resultado individual registrado'}</p></div>
    </div>
    <div className="mt-6 flex items-center gap-3 border-t pt-4"><Award className="size-6 shrink-0 text-primary"/><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase text-muted-foreground">{nextAchievement ? 'Próxima conquista' : 'Galeria completa'}</p><p className="mt-1 text-sm font-bold">{nextAchievement?.title ?? 'Todas as conquistas desbloqueadas'}</p>{nextAchievement && <><progress aria-label={`Progresso de ${nextAchievement.title}`} value={nextAchievement.progress} max={nextAchievement.target} className="mt-2 h-1.5 w-full"/><p className="mt-1 text-[10px] text-muted-foreground">{nextAchievement.progress}/{nextAchievement.target} · {nextAchievement.criterion}</p></>}</div><Button asChild variant="ghost" size="icon" aria-label="Ver minhas conquistas"><Link to="/profile"><ArrowUpRight/></Link></Button></div>
  </section>;
}