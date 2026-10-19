import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, Download, Minus, Plus, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, OvrBadge } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { accountQuery } from '@/lib/app-queries';
import { duelQuery } from '@/lib/duel-queries';
import { canConfirmDuel, canEditDuel, duelStats, isFinalDuel, readStatistics, statLabels, statusLabels, validStatistics, type DuelStatistics } from '@/lib/duel';
import { downloadDuelCard } from '@/lib/duel-card';
import { supabase } from '@/integrations/supabase/client';
export function DuelScreen({ id }: { id: string }) {
  const { data: duel } = useSuspenseQuery(duelQuery(id));
  const { data: account } = useSuspenseQuery(accountQuery());
  const qc = useQueryClient(), [busy, setBusy] = useState(false), [reason, setReason] = useState('');
  const [draft, setDraft] = useState<{ revision: number; stats: DuelStatistics } | null>(null);
  const stats = draft?.revision === duel.revision ? draft.stats : readStatistics(duel.statistics);
  const editable = canEditDuel(duel.status, account.user.id === duel.creator_id);
  const confirmable = canConfirmDuel(duel.status, account.user.id === duel.opponent_id);
  const final = isFinalDuel(duel.status, duel.revision, duel.confirmed_revision);
  async function act(action: string) {
    if (['SAVE', 'SUBMIT'].includes(action) && !validStatistics(stats)) { toast.error('Use números inteiros entre 0 e 1000.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.rpc('operate_duel', { _duel: id, _action: action, _revision: duel.revision, ...(['SAVE', 'SUBMIT'].includes(action) ? { _statistics: stats } : {}), ...(action === 'DISPUTE' ? { _reason: reason } : {}) });
      if (error) throw error;
      setDraft(null); setReason('');
      await Promise.all([qc.invalidateQueries({ queryKey: ['duel', id] }), qc.invalidateQueries({ queryKey: ['duels'] })]);
      toast.success(action === 'CONFIRM' ? 'Duelo confirmado e encerrado!' : action === 'DISPUTE' ? 'Correção solicitada ao adversário.' : action === 'SUBMIT' ? 'Estatísticas enviadas para confirmação.' : 'Lances salvos.');
    } catch (error) { toast.error(error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Não foi possível salvar.'); await qc.invalidateQueries({ queryKey: ['duel', id] }); } finally { setBusy(false); }
  }
  const change = (side: 'home' | 'away', stat: typeof duelStats[number], value: number) => setDraft({ revision: duel.revision, stats: { ...stats, [side]: { ...stats[side], [stat]: value } } });
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Confira os números do nosso Duelo no Súmula FC: ${typeof window === 'undefined' ? '' : window.location.origin}/duel/${id}`)}`;
  return <section className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-4xl">Duelo 1v1</h2><span className="rounded border border-primary/40 px-3 py-2 text-xs font-bold text-primary">{statusLabels[duel.status]}</span></div><p className="text-xs font-bold uppercase text-muted-foreground">Amistoso · Fora do Ranking Global · Revisão {duel.revision}</p>
    {duel.dispute_reason && <div role="status" className="border-l-2 border-primary bg-secondary p-4"><strong>Correção solicitada</strong><p className="mt-2 break-words text-sm">{duel.dispute_reason}</p></div>}
    <div className="text-center"><p className="font-display text-6xl text-primary" aria-label="Placar do duelo">{stats.home.goals} × {stats.away.goals}</p><p className="mt-2 text-sm text-muted-foreground">{final ? 'Resultado definitivo' : 'Placar provisório'}</p></div>
    <div className="grid grid-cols-2 gap-3">{(['home', 'away'] as const).map(side => { const p = duel[side]; return <article key={side} className="min-w-0 rounded-lg border border-primary/30 bg-card p-3 sm:p-5"><div className="mb-4 flex flex-col items-center gap-2"><Avatar name={p.apelido} size={54} ring/><h3 className="max-w-full break-words text-center text-xl">{p.apelido}</h3><span className="text-xs text-muted-foreground">{p.position} · OVR <OvrBadge value={p.overall_rating ?? 70}/></span></div><div className="space-y-4">{duelStats.map(stat => <div key={stat}><label htmlFor={`${side}-${stat}`} className="mb-1 block text-xs font-bold text-muted-foreground">{statLabels[stat]}</label>{editable ? <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="size-7 shrink-0 sm:size-8" disabled={busy || stats[side][stat] <= 0} aria-label={`Diminuir ${statLabels[stat]} de ${p.apelido}`} onClick={() => change(side, stat, stats[side][stat] - 1)}><Minus/></Button><Input id={`${side}-${stat}`} type="number" min={0} max={1000} step={1} className="min-w-0 px-1 text-center" disabled={busy} value={stats[side][stat]} onChange={e => change(side, stat, Number(e.target.value))}/><Button variant="ghost" size="icon" className="size-7 shrink-0 sm:size-8" disabled={busy || stats[side][stat] >= 1000} aria-label={`Aumentar ${statLabels[stat]} de ${p.apelido}`} onClick={() => change(side, stat, stats[side][stat] + 1)}><Plus/></Button></div> : <p className="text-2xl font-bold" id={`${side}-${stat}`}>{stats[side][stat]}</p>}</div>)}</div></article>; })}</div>
    {editable && <div className="flex flex-wrap gap-3"><Button variant="secondary" disabled={busy} onClick={() => act('SAVE')}>Salvar lances</Button><Button disabled={busy} onClick={() => act('SUBMIT')}><Send/>{duel.status === 'DISPUTED' ? 'Reenviar para confirmação' : 'Encerrar e pedir confirmação'}</Button></div>}
    {duel.status === 'PENDING_APPROVAL' && <p className="text-sm text-muted-foreground">{confirmable ? 'Confira os números dos dois atletas antes de confirmar.' : 'Seu adversário precisa confirmar os números para encerrar o duelo.'}</p>}
    {confirmable && <div className="space-y-4"><Button disabled={busy} onClick={() => act('CONFIRM')}><Check/>Confirmar estatísticas e encerrar</Button><div className="space-y-2"><label htmlFor="dispute" className="text-sm font-bold">Números incorretos? Descreva a correção</label><Textarea id="dispute" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} placeholder="Qual estatística precisa mudar?"/><Button variant="secondary" disabled={busy || reason.trim().length < 3} onClick={() => act('DISPUTE')}>Contestar estatísticas</Button></div></div>}
    {duel.status === 'PENDING_APPROVAL' && duel.creator_id === account.user.id && <Button asChild variant="secondary"><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle/>Enviar pedido no WhatsApp</a></Button>}
    {final && <Button variant="secondary" onClick={() => downloadDuelCard(duel.home.apelido, duel.away.apelido, stats).catch(() => toast.error('Não foi possível exportar o card.'))}><Download/>Exportar card do Duelo</Button>}
  </section>;
}