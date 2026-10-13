import { describe, expect, it } from "vitest";
import { waitingTeams } from "./fifo";
import { drawTeams, modalityInfo } from "./draw";
import type { MatchPlayer } from "./match-data";

const player = (id: number, team: MatchPlayer["team"] = "unassigned"): MatchPlayer => ({ player_id: `p${id}`, arrival_order: id, queue_position: 99-id, team, presence: "confirmed", goals: 0, assists: 0, tackles: 0, shots_on_goal: 0, fouls_suffered: 0, fouls_committed: 0, saves: 0, profile: null });
describe("fila FIFO", () => {
  it.each([["x1",2],["x5",10],["x6",12]])("%s comporta %i jogadores em campo", (m, capacity) => {
    expect(modalityInfo(String(m)).size * 2).toBe(capacity);
  });
  it("forma C e D com exatamente 5 atletas e conserva chegada", () => {
    const q = waitingTeams(Array.from({length:12},(_,i)=>player(i+11)).reverse(),5);
    expect(q.teams.map(t=>t.map(p=>p.arrival_order))).toEqual([[11,12,13,14,15],[16,17,18,19,20]]);
    expect(q.reserves.map(p=>p.arrival_order)).toEqual([21,22]);
  });
  it("não chama um grupo incompleto de próximo time", () => {
    const r = drawTeams(Array.from({length:13},(_,i)=>({id:`p${i+1}`,queue:i+1,overall:70})),5,()=>0.3);
    expect([r.p11,r.p12,r.p13]).toEqual(["unassigned","unassigned","unassigned"]);
  });
  it("compacta a fila restante após a promoção do primeiro", () => {
    const q = waitingTeams([player(4),player(3,"colete"),player(6),player(5)],1);
    expect(q.queued.map((p,i)=>[p.player_id,i+1])).toEqual([["p4",1],["p5",2],["p6",3]]);
  });
});