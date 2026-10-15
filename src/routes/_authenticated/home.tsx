import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check, X, Plus, Shuffle, CirclePlay, Trophy } from "lucide-react";
import { toast } from "sonner";
import { QuickActions } from "@/components/home/QuickActions";
import { AppShell, Avatar, SectionTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { MatchDetails, MatchTile, PageError, PageMissing } from "@/components/MatchUI";
import { accountQuery, matchQuery } from "@/lib/app-queries";
import { pageHead } from "@/lib/page-head";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/home")({ head: () => pageHead("Início", "Sua próxima pelada, presença e ações rápidas."), loader: ({context}) => context.queryClient.ensureQueryData(accountQuery()), component: HomePage, errorComponent: PageError, notFoundComponent: PageMissing });
function HomePage() {
 const { data } = useSuspenseQuery(accountQuery());
 const next = [...data.matches].filter(m => m.status !== "finished").sort((a,b) => (a.scheduled_at || "9999").localeCompare(b.scheduled_at || "9999"))[0];
 const last = data.matches.find(m => m.status === "finished");
 return <AppShell action={<Link to="/profile" aria-label="Meu perfil"><Avatar name={data.profile.apelido}/></Link>}>
 <div className="mb-5 flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Salve, {data.profile.apelido}!</p><h1 className="mt-1 text-3xl">Bora pro jogo?</h1></div><Button asChild size="icon" aria-label="Criar pelada"><Link to="/match/create"><Plus/></Link></Button></div>
 {next ? <NextMatch id={next.id} uid={data.user.id}/> : <section className="rounded-lg bg-ink p-6 text-ink-foreground"><p className="text-xs font-bold text-primary">SUA PRÓXIMA PELADA</p><h2 className="mt-4 text-3xl">O próximo jogo começa aqui.</h2><Button asChild className="sport-action mt-5"><Link to="/match/create"><Plus/> Criar minha pelada</Link></Button></section>}
 <QuickActions matchId={next?.id ?? last?.id}/>
 <SectionTitle right={<span className="text-xs font-bold text-muted-foreground">RESENHA EM DIA</span>}>Última partida</SectionTitle>
 {last ? <MatchTile match={last}/> : <div className="border-y py-7 text-sm text-muted-foreground"><Trophy className="mb-3 size-7"/>Seu histórico começa depois do primeiro apito final.</div>}
 <SectionTitle>Minhas peladas</SectionTitle>{data.matches.filter(m => m.id !== next?.id && m.id !== last?.id).map(m => <MatchTile key={m.id} match={m}/>)}
 </AppShell>;
}
function NextMatch({id,uid}:{id:string;uid:string}) {
 const {data} = useSuspenseQuery(matchQuery(id)); const qc=useQueryClient();
 if(!data.match) return null; const match=data.match; const confirmed=data.players.filter(p=>p.presence==="confirmed"); const mine=data.players.find(p=>p.player_id===uid);
 const presence=async(value:string)=>{const {error}=await supabase.rpc("set_presence",{_match:id,_presence:value});if(error) return void toast.error("Não foi possível atualizar presença"); await qc.invalidateQueries({queryKey:["match",id]}); toast.success(value==="confirmed"?"Presença confirmada!":"Presença recusada");};
 return <><section className="rounded-lg bg-ink p-6 text-ink-foreground"><div className="flex justify-between gap-4"><div><p className="text-xs font-extrabold text-primary">SUA PRÓXIMA PELADA</p><h2 className="mt-4 text-4xl break-words">{match.title||"Pelada da semana"}</h2></div><span className="self-start rounded bg-primary px-3 py-2 font-display text-2xl text-primary-foreground">{match.modality}</span></div><MatchDetails match={match}/></section>
 <section className="mt-4 border p-5"><div className="flex justify-between"><div><p className="text-xs font-bold text-muted-foreground">LISTA DE PRESENÇA</p><h2 className="mt-2 text-2xl">Vai pro jogo?</h2></div><span className="font-display text-3xl">{confirmed.length}</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div className="flex -space-x-2">{confirmed.slice(0,4).map(p=><Avatar key={p.player_id} name={p.profile?.apelido||"Atleta"}/>)}{confirmed.length===0&&<span className="text-sm text-muted-foreground">Seja o primeiro a confirmar</span>}</div><div className="flex gap-2"><Button variant={mine?.presence==="confirmed"?"default":"secondary"} onClick={()=>presence("confirmed")}><Check/> Vou</Button><Button variant={mine?.presence==="declined"?"default":"secondary"} onClick={()=>presence("declined")}><X/> Não vou</Button></div></div></section>
 </>;
}
