import { describe, expect, it } from 'vitest';
import { canConfirmDuel, canEditDuel, isFinalDuel, readStatistics, validStatistics } from './duel';
describe('Duelo e confirmação', () => {
  it('apenas o desafiado confirma números pendentes', () => { expect(canConfirmDuel('PENDING_APPROVAL', true)).toBe(true); expect(canConfirmDuel('PENDING_APPROVAL', false)).toBe(false); });
  it('contestação permite correção pelo criador e não pelo desafiado', () => { expect(canEditDuel('DISPUTED', true)).toBe(true); expect(canEditDuel('DISPUTED', false)).toBe(false); });
  it('números enviados ficam bloqueados até contestação', () => { expect(canEditDuel('PENDING_APPROVAL', true)).toBe(false); });
  it('correção contestada exige reenvio antes da confirmação', () => { expect(canConfirmDuel('DISPUTED', true)).toBe(false); expect(canConfirmDuel('PENDING_APPROVAL', true)).toBe(true); });
  it('uma confirmação anterior não finaliza uma nova revisão', () => { expect(isFinalDuel('FINISHED', 3, 1)).toBe(false); expect(isFinalDuel('FINISHED', 3, 3)).toBe(true); });
  it('resultado pendente nunca é definitivo', () => { expect(isFinalDuel('PENDING_APPROVAL', 1, null)).toBe(false); });
  it('preserva os números registrados das duas equipes', () => { const s = readStatistics({home:{goals:2,assists:0,tackles:3,saves:1},away:{goals:1,assists:0,tackles:2,saves:4}}); expect(s.home.goals).toBe(2); expect(s.away.saves).toBe(4); expect(validStatistics(s)).toBe(true); });
  it('recusa números negativos e fracionados', () => { const s = readStatistics(null); s.home.goals=-1; expect(validStatistics(s)).toBe(false); s.home.goals=1.5; expect(validStatistics(s)).toBe(false); });
});