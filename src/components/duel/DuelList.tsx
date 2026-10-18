import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/AppShell';
import { duelsQuery } from '@/lib/duel-queries';
import { readStatistics, statusLabels } from '@/lib/duel';
export function DuelList({ uid, finishedOnly = false }: { uid: string; finishedOnly?: boolean }) {
  const { data } = useSuspenseQuery(duelsQuery());
  const rows = data.filter(d => finishedOnly ? d.status === 'FINISHED' : d.status !== 'FINISHED');
  return <section aria-label={finishedOnly ? 'Histórico de duelos' : 'Seus duelos'}><SectionTitle right={<Button asChild variant="ghost"><Link to="/duel/create"><Swords/>Novo duelo</Link></Button>}>{finishedOnly ? 'Histórico X1' : 'Seus duelos'}</SectionTitle>{!rows.length && <p className="py-3 text-sm text-muted-foreground">{finishedOnly ? 'Nenhum duelo confirmado ainda.' : 'Nenhum duelo em andamento.'}</p>}{rows.map(d => { const s = readStatistics(d.statistics); return <Link key={d.id} to="/duel/$duelId" params={{ duelId: d.id }} className="mb-3 block rounded-lg border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="break-words">{d.home.apelido} {s.home.goals} × {s.away.goals} {d.away.apelido}</strong><span className="text-xs font-bold text-primary">{statusLabels[d.status]}</span></div>{!finishedOnly && <p className="mt-2 text-sm text-muted-foreground">{d.status === 'PENDING_APPROVAL' && d.opponent_id === uid ? 'Confira as estatísticas e confirme ou solicite correção.' : d.status === 'DISPUTED' && d.creator_id === uid ? 'Seu adversário pediu uma correção. Revise e envie novamente.' : 'Abrir súmula →'}</p>}</Link>; })}</section>;
}