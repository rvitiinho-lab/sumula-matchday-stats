import type { CareerStats } from "./profile-achievements";
export type FutProfile = { nome: string; apelido: string; position: string; overall_rating: number | null; quote: string | null };
export async function exportProfileCard(profile: FutProfile, stats: CareerStats) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Carta indisponível");
  const theme = getComputedStyle(document.documentElement);
  const token = (name: string) => theme.getPropertyValue(name).trim();
  ctx.fillStyle = token("--background"); ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = token("--card"); ctx.beginPath(); ctx.roundRect(72, 210, 936, 1490, 32); ctx.fill();
  ctx.strokeStyle = token("--primary"); ctx.lineWidth = 3; ctx.stroke();
  const text = (value: string, x: number, y: number, size: number, color = "--foreground", display = false, max = 850) => {
    ctx.fillStyle = token(color); ctx.font = `${display ? "400" : "700"} ${size}px ${display ? "Anton" : "Manrope"}, sans-serif`;
    while (ctx.measureText(value).width > max && size > 20) { size -= 2; ctx.font = `${display ? "400" : "700"} ${size}px ${display ? "Anton" : "Manrope"}, sans-serif`; }
    ctx.fillText(value, x, y);
  };
  text("SÚMULA FC", 72, 120, 40, "--primary", true);
  text("CARTA DO ATLETA", 72, 174, 22, "--muted-foreground");
  text(String(profile.overall_rating ?? 70), 125, 410, 150, "--primary", true);
  text(profile.position, 125, 470, 36, "--primary", true);
  ctx.strokeStyle = token("--primary"); ctx.beginPath(); ctx.arc(540, 650, 145, 0, Math.PI * 2); ctx.stroke();
  const initials = profile.apelido.slice(0, 2).toUpperCase(); ctx.textAlign = "center";
  text(initials, 540, 690, 104, "--primary", true);
  text(profile.apelido.toUpperCase(), 540, 930, 100, "--foreground", true, 810);
  text(profile.nome, 540, 990, 30, "--muted-foreground", false, 810);
  const metrics = [[stats.games, "JOGOS"], [stats.goals, "GOLS"], [stats.assists, "ASSISTÊNCIAS"], [stats.saves, "DEFESAS"], [stats.tackles, "DESARMES"], [stats.mvps, "MVPS"]] as const;
  metrics.forEach(([v, label], i) => { const x = 250 + (i % 3) * 290, y = 1150 + Math.floor(i / 3) * 180; text(String(v), x, y, 72, "--primary", true); text(label, x, y + 48, 20, "--muted-foreground"); });
  const quote = (profile.quote ?? "").slice(0, 120); ctx.font = "700 32px Manrope, sans-serif";
  const lines: string[] = []; let line = "";
  for (const word of quote.split(" ")) { const next = `${line}${line ? " " : ""}${word}`; if (ctx.measureText(next).width > 770) { lines.push(line); line = word; } else line = next; } if (line) lines.push(line);
  lines.forEach((l, i) => text(l, 540, 1510 + i * 44, 32, "--foreground", false, 770));
  text("SUA RESENHA TEM HISTÓRIA.", 540, 1810, 30, "--muted-foreground", true);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png")); if (!blob) throw new Error("Carta indisponível");
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `sumula-fc-${profile.apelido}-stories.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}