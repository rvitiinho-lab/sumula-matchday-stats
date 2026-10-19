import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { MatchTile, PageError, PageMissing } from "@/components/MatchUI";
import { Button } from "@/components/ui/button";
import { accountQuery } from "@/lib/app-queries";
import { pageHead } from "@/lib/page-head";
import { DuelList } from '@/components/duel/DuelList';
import { duelsQuery } from '@/lib/duel-queries';
export const Route=createFileRoute("/_authenticated/results")({head:()=>pageHead("Resultados","Histórico, placares e desempenho das suas peladas e duelos confirmados."),loader:async({context})=>{await Promise.all([context.queryClient.ensureQueryData(accountQuery()),context.queryClient.ensureQueryData(duelsQuery())]);},component:ResultsPage,errorComponent:PageError,notFoundComponent:PageMissing});
function ResultsPage(){const {data}=useSuspenseQuery({...accountQuery(),refetchInterval:3000});const matches=data.matches.filter(m=>m.status==="finished" && !m.pelada_id);return <AppShell title="Resultados"><section className="flex items-center justify-between border-b pb-6"><div><p className="text-xs font-bold text-muted-foreground">SUA HISTÓRIA EM CAMPO</p><h2 className="mt-2 text-4xl">Cada jogo conta.</h2></div><Trophy className="size-10"/></section><SectionTitle right={<span className="text-sm text-muted-foreground">{matches.length} peladas</span>}>Apito final</SectionTitle>{matches.map(m=><div key={m.id}><MatchTile match={m}/><Button asChild variant="ghost" className="my-2"><Link to="/match/summary/$matchId" params={{matchId:m.id}}>Ver MVPs, Melhor da Noite e cards →</Link></Button></div>)}{!matches.length&&<p className="py-10 text-muted-foreground">Nenhuma partida encerrada ainda.</p>}<DuelList uid={data.user.id} finishedOnly/></AppShell>;}
