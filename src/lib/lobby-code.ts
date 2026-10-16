export function parseLobbyCode(raw: string): string | null {
  const v = raw.trim();
  const m = v.match(/lobby\/([0-9a-f-]{36})/i) ?? v.match(/^([0-9a-f-]{36})$/i);
  return m?.[1] ?? null;
}
