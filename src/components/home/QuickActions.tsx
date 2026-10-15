import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Shuffle,Play,Trophy,Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/AppShell';
import { QuickDrawModal } from '@/components/match/QuickDrawModal';
import { CreateTournamentModal } from '@/components/tournament/CreateTournamentModal';
export function QuickActions({matchId}:{matchId?:string|undefined}){const [draw,setDraw]=useState(false),[tournament,setTournament]=useState(false);return <><SectionTitle>Ações rápidas</SectionTitle><div className="grid grid-cols-2 gap-3"><Button variant="secondary" className="sport-action h-24 flex-col text-sm" onClick={()=>setDraw(true)}><Shuffle/>Sorteador Rápido</Button><Button asChild className="sport-action h-24 flex-col text-sm">{matchId?<Link to="/lobby/$matchId" params={{matchId}}><Play/>Iniciar/Súmula</Link>:<Link to="/match/create"><Play/>Iniciar/Súmula</Link>}</Button><Button variant="secondary" className="sport-action h-24 flex-col text-sm" onClick={()=>setTournament(true)}><Trophy/>Organizar Campeonato</Button><Button asChild variant="secondary" className="sport-action h-24 flex-col text-sm"><Link to="/friends"><Users/>Acompanhar Amigos</Link></Button></div><Button asChild variant="ghost" className="mt-2"><Link to="/tournaments">Meus campeonatos</Link></Button><QuickDrawModal open={draw} onOpenChange={setDraw}/><CreateTournamentModal open={tournament} onOpenChange={setTournament}/></>;}
