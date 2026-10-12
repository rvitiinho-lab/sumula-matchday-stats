import { describe, expect, it } from "vitest";
import { elapsedSeconds, ratingValid } from "./game-rules";
describe("Regras da partida", () => {
  it("aceita notas de 1 a 10", () => {
    expect(ratingValid(1)).toBe(true); expect(ratingValid(10)).toBe(true);
    expect(ratingValid(0)).toBe(false); expect(ratingValid(11)).toBe(false); expect(ratingValid(7.5)).toBe(false);
  });
  it("congela o tempo quando a partida termina", () => {
    expect(elapsedSeconds("2026-10-12T20:00:00Z", "2026-10-12T20:45:00Z", Date.parse("2026-10-12T22:00:00Z"))).toBe(2700);
  });
});