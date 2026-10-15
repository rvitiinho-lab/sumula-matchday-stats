import { createFileRoute,Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus,Trophy } from 'lucide-react';
import { AppShell,BackHome } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { PageError } from '@/components/MatchUI';
import { CreateTournamentModal } from '@/components/tournament/CreateTournamentModal';
import { tournamentsQuery } from '@/lib/module-queries';
import { pageHead } from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/tournaments')({head:()=>pageHead('Campeonatos','Ligas, mata-mata, equipes e placares do Súmula FC.'),loader:({context})=>context.queryClient.ensureQueryData(tournamentsQuery()),component:Page,errorComponent:PageError});
function Page(){const {data}=useSuspenseQuery(tournamentsQuery());const [open,setOpen]=useState(false);return <AppShell title="Campeonatos" back={<BackHome/>}><div className="flex items-center justify-between gap-3 border-b pb-5"><Trophy className="size-10"/><Button onClick={()=>setOpen(true)}><Plus/>Criar campeonato</Button></div>{data.map(t=><Link className="flex items-center justify-between border-b py-5" key={t.id} to="/tournament/$tournamentId" params={{tournamentId:t.id}}><div><h2 className="text-2xl">{t.name}</h2><p className="mt-2 text-xs text-muted-foreground">{t.format==='league'?'Pontos Corridos':'Mata-Mata'}</p></div><span>→</span></Link>)}{!data.length&&<p className="py-10 text-muted-foreground">Nenhum campeonato criado ainda.</p>}<CreateTournamentModal open={open} onOpenChange={setOpen}/></AppShell>;}
