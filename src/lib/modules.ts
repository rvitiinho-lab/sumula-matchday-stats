import { RoundRobin, SingleElimination } from 'tournament-pairings';
export type ScheduleGame = { round:number; position:number; home:number|null; away:number|null; next_round:number|null; next_position:number|null };
export function schedule(format:'league'|'knockout', count:number):ScheduleGame[] {
 if(!Number.isInteger(count)||count<2||count>32)throw new Error('Use de 2 a 32 equipes');
 const ids=Array.from({length:count},(_,i)=>String(i+1));
 const matches=format==='league'?RoundRobin(ids,1,true):SingleElimination(ids,1,false,true);
 return matches.filter(m=>format!=='league'||m.player1&&m.player2).map(m=>({round:m.round,position:m.match,home:m.player1?Number(m.player1):null,away:m.player2?Number(m.player2):null,next_round:m.win?.round??null,next_position:m.win?.match??null}));
}
export function quickDraw(text:string,size:number,random=Math.random):string[][] {
 if(!Number.isInteger(size)||size<1||size>11)throw new Error('Escolha de 1 a 11 atletas');
 const names=text.split(/[\n,;]+/).map(n=>n.trim()).filter(Boolean);
 if(names.length<2)throw new Error('Informe pelo menos dois nomes');
 for(let i=names.length-1;i>0;i--){const j=Math.floor(random()*(i+1));const a=names[i],b=names[j];if(a!==undefined&&b!==undefined){names[i]=b;names[j]=a;}}
 return Array.from({length:Math.ceil(names.length/size)},(_,i)=>names.slice(i*size,(i+1)*size));
}
export function permissions(role:'ADMIN'|'MESARIO'|'PLAYER'){return {operate:role!=='PLAYER',draw:role!=='PLAYER',close:role==='ADMIN',removeOthers:role==='ADMIN'};}
export function clockSeconds(m:{clock_seconds:number;clock_running_at:string|null;started_at:string|null;finished_at:string|null},now:number){if(m.clock_running_at)return m.clock_seconds+Math.max(0,Math.floor((now-new Date(m.clock_running_at).getTime())/1000));if(m.clock_seconds)return m.clock_seconds;if(m.started_at&&m.finished_at)return Math.max(0,Math.floor((new Date(m.finished_at).getTime()-new Date(m.started_at).getTime())/1000));return 0;}
export type TableGame={home_id:string|null;away_id:string|null;home_score:number|null;away_score:number|null;played:boolean};
export function leagueTable(teams:{id:string;name:string}[],games:TableGame[]){return teams.map(t=>{let wins=0,draws=0,losses=0,gf=0,ga=0;for(const g of games.filter(g=>g.played&&(g.home_id===t.id||g.away_id===t.id))){const a=(g.home_id===t.id?g.home_score:g.away_score)??0,b=(g.home_id===t.id?g.away_score:g.home_score)??0;gf+=a;ga+=b;if(a>b)wins++;else if(a===b)draws++;else losses++;}const played=wins+draws+losses;return {...t,wins,draws,losses,gf,ga,gd:gf-ga,played,points:wins*3+draws,percentage:played?Math.round((wins*3+draws)/(played*3)*100):0};}).sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name));}
