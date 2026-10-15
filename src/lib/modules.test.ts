import { describe,it,expect } from 'vitest';
import { schedule,quickDraw,permissions,clockSeconds,leagueTable } from './modules';
describe('módulos do Súmula FC',()=>{
 it('campeonatos aceitam 32 equipes e rejeitam 33',()=>{expect(schedule('league',32)).toHaveLength(496);expect(()=>schedule('league',33)).toThrow();});
 it('pontos corridos gera cada confronto uma vez',()=>{const games=schedule('league',4);expect(games).toHaveLength(6);expect(new Set(games.map(g=>[g.home,g.away].sort().join('-'))).size).toBe(6);});
 it('mata-mata preserva avanço de vencedores',()=>{const games=schedule('knockout',8);expect(games).toHaveLength(7);expect(games.filter(g=>g.next_round===null)).toHaveLength(1);});
 it('sorteio avulso não perde nomes e agrupa por tamanho',()=>{const teams=quickDraw('Ana\nBia\nCaio\nDavi\nEva',2,()=>0.5);expect(teams.map(t=>t.length)).toEqual([2,2,1]);expect(teams.flat().sort()).toEqual(['Ana','Bia','Caio','Davi','Eva']);});
 it('PLAYER não opera nem sorteia',()=>{expect(permissions('PLAYER')).toEqual({operate:false,draw:false,close:false,removeOthers:false});});
 it('MESARIO opera mas não sorteia, remove nem encerra',()=>{expect(permissions('MESARIO')).toEqual({operate:true,draw:false,close:false,removeOthers:false});});
 it('ADMIN pode operar e encerrar',()=>{expect(permissions('ADMIN').close).toBe(true);expect(permissions('ADMIN').draw).toBe(true);});
 it('cronômetro não avança pausado e soma retomada',()=>{const m={clock_seconds:60,clock_running_at:null,started_at:null,finished_at:null};expect(clockSeconds(m,90000)).toBe(60);expect(clockSeconds({...m,clock_running_at:'1970-01-01T00:01:10Z'},90000)).toBe(80);});
 it('classificação soma pontos, gols e saldo concretos',()=>{const rows=leagueTable([{id:'a',name:'A'},{id:'b',name:'B'}],[{home_id:'a',away_id:'b',home_score:2,away_score:1,played:true}]);expect(rows[0]).toMatchObject({id:'a',points:3,played:1,wins:1,gf:2,ga:1,gd:1,percentage:100});expect(rows[1]).toMatchObject({points:0,losses:1,gd:-1});});
});
