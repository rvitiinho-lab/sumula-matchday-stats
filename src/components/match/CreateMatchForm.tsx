import { useState } from 'react';
import { ArrowRight, Copy, MessageCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODALITIES, type Modality } from '@/lib/draw';
import { supabase } from '@/integrations/supabase/client';
import { whatsappInvite } from '@/lib/match-invite';
export function CreateMatchForm({ onOpened }: { onOpened?: () => void }) {
  const [title,setTitle]=useState(''), [date,setDate]=useState(''), [location,setLocation]=useState(''), [modality,setModality]=useState<Modality>('x5'), [busy,setBusy]=useState(false), [created,setCreated]=useState<{id:string;url:string;title:string}|null>(null);
  const qc=useQueryClient();
  if(created) return <div className="space-y-4"><p className="text-lg font-bold text-primary">Pelada criada!</p><p className="break-words font-display text-3xl">{created.title}</p><div className="flex items-center gap-2"><Input aria-label="Link da pelada" readOnly value={created.url}/><Button variant="secondary" size="icon" aria-label="Copiar link da pelada" onClick={async()=>{try{await navigator.clipboard.writeText(created.url);toast.success('Link copiado!');}catch{toast.error('Não foi possível copiar');}}}><Copy/></Button></div><Button asChild className="sport-action w-full"><a href={whatsappInvite(created.url,created.title)} target="_blank" rel="noopener noreferrer"><MessageCircle/>Compartilhar no WhatsApp</a></Button><Button asChild variant="secondary" className="w-full"><Link to="/lobby/$matchId" params={{matchId:created.id}} onClick={onOpened}>Abrir lobby<ArrowRight/></Link></Button></div>;
  return <form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const {data,error}=await supabase.rpc('create_pelada',{_title:title.trim(),_modality:modality,_scheduled:date?new Date(date).toISOString():null,_location:location.trim()});if(error||!data)throw error;setCreated({id:data,url:`${window.location.origin}/lobby/${data}`,title:title.trim()});await qc.invalidateQueries({queryKey:['account']});}catch{toast.error('Não foi possível criar a pelada. Tente novamente.');}finally{setBusy(false);}}}>
    <label className="block text-sm font-bold">Nome da pelada<Input required maxLength={60} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Pelada dos crias" className="mt-2"/></label>
    <label className="block text-sm font-bold">Data e horário<Input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="mt-2"/></label>
    <label className="block text-sm font-bold">Local / Arena<Input maxLength={120} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Quadra, campo ou arena" className="mt-2"/></label>
    <fieldset><legend className="mb-2 text-sm font-bold">Modalidade</legend><div className="grid grid-cols-3 gap-2">{MODALITIES.map(m=><Button type="button" key={m.id} variant={modality===m.id?'default':'secondary'} aria-pressed={modality===m.id} onClick={()=>setModality(m.id)}>{m.id}</Button>)}</div></fieldset>
    <Button disabled={busy||!title.trim()} className="sport-action w-full">{busy?'Criando…':'Criar pelada'}<ArrowRight/></Button>
  </form>;
}