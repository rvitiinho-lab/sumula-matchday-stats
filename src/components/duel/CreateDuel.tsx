import { Link, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Swords } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { duelOpponentsQuery } from '@/lib/duel-queries';
import { supabase } from '@/integrations/supabase/client';
export function CreateDuel() {
  const { data } = useSuspenseQuery(duelOpponentsQuery());
  const [opponent, setOpponent] = useState(''), [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function create() { setBusy(true); try { const { data: id, error } = await supabase.rpc('create_duel', { _opponent: opponent }); if (error) throw error; await navigate({ to: '/duel/$duelId', params: { duelId: id } }); } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível iniciar o duelo.'); } finally { setBusy(false); } }
  return <section><h2 className="mb-5 text-4xl">Duelo Avulso 1v1</h2>{data.length ? <div className="space-y-4"><Label htmlFor="opponent">Atleta que você acompanha</Label><Select value={opponent} onValueChange={setOpponent}><SelectTrigger id="opponent"><SelectValue placeholder="Escolher adversário"/></SelectTrigger><SelectContent>{data.map(p => <SelectItem key={p.id} value={p.id}>{p.apelido} · {p.nome}</SelectItem>)}</SelectContent></Select><Button disabled={!opponent || busy} onClick={create}><Swords/>{busy ? 'Iniciando…' : 'Iniciar Duelo'}</Button></div> : <div className="space-y-4"><p className="text-muted-foreground">Você ainda não acompanha outros atletas.</p><Button asChild><Link to="/friends">Acompanhar Amigos</Link></Button></div>}</section>;
}