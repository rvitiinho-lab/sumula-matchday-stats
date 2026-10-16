import { Link } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Clock3, Flame, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell, Avatar, OvrBadge } from '@/components/AppShell';
import { MatchDetails } from '@/components/MatchUI';
import { Button } from '@/components/ui/button';
import { QuickActions } from './QuickActions';
import { UserEvolutionWidget } from './UserEvolutionWidget';
import { ResenhaGazette } from './ResenhaGazette';
import { accountQuery, matchQuery } from '@/lib/app-queries';
import { inCurrentMonth, personalEvolution, roundDate } from '@/lib/home-insights';
import { supabase } from '@/integrations/supabase/client';
import { CreateMatchModal } from '@/components/match/CreateMatchModal';

export function HomePage() {
  const { data } = useSuspenseQuery(accountQuery());
  const [now, setNow] = useState<Date | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => { setNow(new Date()); const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);
  const next = [...data.matches].filter(m => m.status !== 'finished' && !m.pelada_closed).sort((a,b) => Number(b.status === 'in_progress') - Number(a.status === 'in_progress') || (a.scheduled_at ?? '9999').localeCompare(b.scheduled_at ?? '9999'))[0];
  const evolution = now ? personalEvolution(data.stats.map(s => ({ ...s, goals: s.goals ?? 0, assists: s.assists ?? 0, victory_points: s.victory_points ?? 0, presence: s.presence ?? 'pending' })), data.matches, data.mvps, now) : null;
  const roots = now ? [...new Set(data.matches.filter(m => m.status === 'finished' && inCurrentMonth(roundDate(m), now)).map(m => m.pelada_id ?? m.id))] : [];
  return <AppShell>
    <div className="mb-5 flex justify-end"><Button onClick={() => setCreateOpen(true)}><Plus/>Criar Pelada</Button></div>
    <CreateMatchModal open={createOpen} onOpenChange={setCreateOpen}/>
    <section className="flex items-center gap-4 pb-6 pt-1" aria-label="Meu atleta"><Link to="/profile" aria-label="Meu perfil" className="fut-avatar rounded-full"><Avatar name={data.profile.apelido} size={64} ring/></Link><div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold uppercase text-muted-foreground">Salve, atleta</p><h1 className="mt-1 break-words text-3xl">{data.profile.apelido}</h1><div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-primary"><Flame className="size-3.5 shrink-0"/><span>{evolution ? `${evolution.streak} ${evolution.streak === 1 ? 'semana seguida' : 'semanas seguidas'} no racha` : '—'}</span></div></div><div className="shrink-0 text-center"><span className="mb-1 block text-[10px] font-bold text-muted-foreground">OVR</span>{data.profile.overall_rating === null ? <span>—</span> : <OvrBadge value={data.profile.overall_rating}/>}</div></section>
    {next ? <NextMatch id={next.id} now={now} uid={data.user.id}/> : <section className="rounded-lg border border-primary/30 bg-card p-6"><p className="text-[10px] font-extrabold uppercase text-primary">Sua próxima pelada</p><h2 className="mt-4 text-3xl">O próximo jogo começa aqui.</h2><Button className="sport-action mt-5" onClick={() => setCreateOpen(true)}><Plus/>Criar minha pelada</Button></section>}
    <QuickActions matchId={next?.id}/>
    {evolution && <UserEvolutionWidget evolution={evolution}/>}
    {now && <ResenhaGazette roots={roots} now={now}/>}
  </AppShell>;
}
function NextMatch({ id, uid, now }: { id: string; uid: string; now: Date | null }) {
  const { data } = useSuspenseQuery(matchQuery(id)), qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const match = data.match;
  if (!match) return null;
  const confirmed = data.players.filter(p => p.presence === 'confirmed'), mine = data.players.find(p => p.player_id === uid);
  const remaining = now && match.scheduled_at ? Math.max(0, Math.ceil((new Date(match.scheduled_at).getTime() - now.getTime()) / 60000)) : null;
  const countdown = match.status === 'in_progress' ? 'Bola rolando' : remaining === null ? 'Horário a definir' : remaining === 0 ? 'Horário marcado chegou' : remaining >= 1440 ? `Faltam ${Math.floor(remaining/1440)}d ${Math.floor(remaining%1440/60)}h` : `Faltam ${Math.floor(remaining/60)}h ${remaining%60}min`;
  const presence = async (value: string) => {
    setSaving(true);
    try { const { error } = await supabase.rpc('set_presence', { _match: id, _presence: value }); if (error) throw error; await qc.invalidateQueries({ queryKey: ['match', id] }); toast.success(value === 'confirmed' ? 'Presença confirmada!' : 'Presença recusada'); }
    catch { toast.error('Não foi possível atualizar presença'); } finally { setSaving(false); }
  };
  return <section className="overflow-hidden rounded-lg border border-primary/30 bg-card" aria-label="Sua próxima pelada"><div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-extrabold uppercase text-primary">Sua próxima pelada</p><span className="rounded border px-2 py-1 text-xs font-bold">{match.modality}</span></div><h2 className="mt-4 break-words text-3xl sm:text-4xl">{match.title || 'Pelada da semana'}</h2><MatchDetails match={match}/><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-bold text-primary"><Clock3 className="size-4"/>{countdown}</span><span className="text-xs text-muted-foreground">{confirmed.length} confirmados</span></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t bg-secondary/30 px-5 py-4"><div className="flex gap-2"><Button disabled={saving} aria-pressed={mine?.presence === 'confirmed'} variant={mine?.presence === 'confirmed' ? 'default' : 'secondary'} onClick={() => presence('confirmed')}><Check/>Vou</Button><Button disabled={saving} aria-pressed={mine?.presence === 'declined'} variant={mine?.presence === 'declined' ? 'default' : 'secondary'} onClick={() => presence('declined')}><X/>Não vou</Button></div><Button asChild variant="ghost" size="icon" aria-label="Abrir pelada"><Link to="/lobby/$matchId" params={{ matchId: id }}><ArrowUpRight/></Link></Button></div></section>;
}
