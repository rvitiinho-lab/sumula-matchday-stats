import { describe, expect, it } from 'vitest';
import { chatTextAllowed } from './chat-moderation';
describe('moderação da resenha', () => {
  it('permite gírias esportivas solicitadas', () => { for (const word of ['foda','carai','poha','mano']) expect(chatTextAllowed(`Que jogo ${word}`)).toBe(true); });
  it('bloqueia ameaça de violência', () => { expect(chatTextAllowed('vou te matar')).toBe(false); expect(chatTextAllowed('VOU TE M4T4R')).toBe(false); });
  it('bloqueia assédio grave', () => { expect(chatTextAllowed('vou te estuprar')).toBe(false); });
  it('bloqueia preconceito', () => { expect(chatTextAllowed('negro inferior')).toBe(false); expect(chatTextAllowed('heil hitler')).toBe(false); });
});