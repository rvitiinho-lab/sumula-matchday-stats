import { useQueries } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Crown, Flame, Hand, Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { peladaQuery } from '@/lib/app-queries';
import { gazetteStories } from '@/lib/home-insights';

export function ResenhaGazette({ roots, now }: { roots: string[]; now: Date }) {
  const queries = useQueries({ queries: roots.map(peladaQuery) });
  const loading = queries.some(q => q.isPending), failed = queries.some(q => q.isError);
  const stories = gazetteStories(queries.flatMap(q => q.data?.rounds ?? []), now);
  return <section className="mt-6 pb-2" aria-labelledby="gazette-title">
    <div className="flex items-center justify-between gap-3 border-b border-primary pb-2"><div><p className="text-[10px] font-extrabold uppercase text-primary">Edição de {now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'long' })}</p><h2 id="gazette-title" className="mt-1 text-2xl">Gazeta da Resenha</h2></div><Newspaper className="size-5 shrink-0"/></div>
    <p className="mt-2 text-[10px] text-muted-foreground">Destaques do mês nas suas peladas</p>
    {loading ? <div role="status" className="mt-4 h-24 animate-pulse rounded-lg border bg-card p-5 text-sm text-muted-foreground">Fechando a edição…</div> : failed ? <div role="alert" className="py-6"><p className="text-sm text-muted-foreground">Não foi possível carregar os destaques.</p><Button variant="ghost" className="mt-2" onClick={() => queries.forEach(q => void q.refetch())}><RefreshCw/>Tentar novamente</Button></div> : stories.length ? <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3" aria-label="Manchetes do mês">{stories.map(s => { const Icon = s.kind === 'mvp' ? Crown : s.kind === 'goals' ? Flame : Hand; return <article key={s.id} className="flex w-[85%] min-w-0 shrink-0 snap-start flex-col rounded-lg border bg-card p-3 sm:w-[48%]"><div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase text-primary">{s.kind === 'mvp' ? 'MVP da última rodada' : s.kind === 'goals' ? 'Artilharia do mês' : 'Defesas difíceis'}</span><Icon className="size-5 text-primary"/></div><h3 className="mt-3 break-words text-lg leading-tight">{s.kind === 'mvp' ? <>{s.name} decidiu o racha.</> : s.kind === 'goals' ? <>{s.name} {s.tied ? 'divide a liderança' : 'é artilheiro isolado'} com {s.value} {s.value === 1 ? 'gol' : 'gols'}.</> : <>Paredão! {s.name} {s.tied ? 'divide a liderança' : 'lidera'} com {s.value} {s.value === 1 ? 'defesa difícil' : 'defesas difíceis'}.</>}</h3><Button asChild variant="link" className="mt-auto justify-start px-0 pt-3"><Link to="/match/summary/$matchId" params={{ matchId: s.matchId }}>Ver súmula<ArrowUpRight/></Link></Button></article>; })}</div> : <div className="border-b py-4"><p className="font-display text-xl">A próxima manchete vem do campo.</p><p className="mt-2 text-sm text-muted-foreground">Ainda não há destaques registrados neste mês.</p></div>}
  </section>;
}