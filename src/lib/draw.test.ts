import { describe, it, expect } from "vitest";
import { drawTeams, modalityInfo } from "./draw";

describe("capacidade por modalidade", () => {
  it("x1=8, x2=16, x5=40, x6=48, x7=56, x11=88", () => {
    expect(["x1", "x2", "x5", "x6", "x7", "x11"].map((m) => modalityInfo(m).max)).toEqual([8, 16, 40, 48, 56, 88]);
  });
});

describe("sorteio híbrido", () => {
  const players = Array.from({ length: 13 }, (_, i) => ({ id: `p${i + 1}`, queue: i + 1, overall: 60 + i * 3 }));
  const r = drawTeams(players, 2, () => 0.3);

  it("titulares são os 4 primeiros por chegada", () => {
    const starters = Object.entries(r).filter(([, t]) => t === "colete" || t === "sem_colete").map(([id]) => id).sort();
    expect(starters).toEqual(["p1", "p2", "p3", "p4"]);
  });
  it("titulares equilibrados (2 vs 2, mesma soma)", () => {
    const sum = (t: string) => players.filter((p) => r[p.id] === t).reduce((s, p) => s + p.overall, 0);
    expect(players.filter((p) => r[p.id] === "colete").length).toBe(2);
    expect(sum("colete")).toBe(sum("sem_colete"));
  });
  it("próximas preenchidas por ordem de chegada", () => {
    expect([r.p5, r.p6, r.p7, r.p8, r.p9, r.p10, r.p11]).toEqual(["proxima_1", "proxima_1", "proxima_2", "proxima_2", "proxima_3", "proxima_3", "unassigned"]);
  });
});
