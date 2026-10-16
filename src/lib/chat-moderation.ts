export const CHAT_BLOCKED = 'Mensagem bloqueada por conter termos inadequados';
export function sanitizeChat(text: string) { return text.replace(/[\u0000-\u001f\u007f]/g, '').trim(); }
export function chatTextAllowed(text: string) {
  const clean = sanitizeChat(text);
  const normalized = clean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[01234578]/g, c => ({'0':'o','1':'l','2':'z','3':'e','4':'a','5':'s','7':'t','8':'b'}[c] ?? c)).replace(/[^a-z]+/g, ' ');
  return clean.length > 0 && clean.length <= 500 && !/(^| )(estupr[a-z]*|pedofil[a-z]*|nazist[a-z]*|neonazist[a-z]*|heil hitler|sieg heil|vou (te |)(matar|esfaquear|estuprar)|matar (voce|voces|negros|gays)|negro (imundo|inferior)|preto (imundo|inferior)|macaco|traveco)( |$)/.test(normalized);
}