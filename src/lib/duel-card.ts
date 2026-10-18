import type { DuelStatistics } from './duel';
export async function downloadDuelCard(home: string, away: string, stats: DuelStatistics) {
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Imagem indisponível.');
  const theme = getComputedStyle(document.documentElement);
  ctx.fillStyle = theme.getPropertyValue('--background').trim(); ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = theme.getPropertyValue('--primary').trim(); ctx.font = 'bold 70px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SÚMULA FC', 540, 230);
  ctx.fillStyle = theme.getPropertyValue('--foreground').trim(); ctx.font = 'bold 46px sans-serif'; ctx.fillText('DUELO 1V1 · CONFIRMADO', 540, 340);
  for (const [i, name] of [home, away].entries()) {
    const x = 70 + i * 500; ctx.strokeStyle = theme.getPropertyValue('--primary').trim(); ctx.lineWidth = 3; ctx.strokeRect(x, 530, 440, 680);
    ctx.fillStyle = theme.getPropertyValue('--primary').trim(); ctx.font = 'bold 120px sans-serif'; ctx.fillText(name.slice(0, 2).toUpperCase(), x + 220, 750);
    let size = 48; ctx.font = `bold ${size}px sans-serif`; while (ctx.measureText(name).width > 390 && size > 20) { size -= 2; ctx.font = `bold ${size}px sans-serif`; } ctx.fillText(name, x + 220, 860);
    const s = i === 0 ? stats.home : stats.away; ctx.fillStyle = theme.getPropertyValue('--foreground').trim(); ctx.font = 'bold 30px sans-serif'; ctx.fillText(`${s.goals} GOLS · ${s.assists} ASSIST.`, x + 220, 990); ctx.fillText(`${s.tackles} DESARMES`, x + 220, 1060); ctx.fillText(`${s.saves} DEFESAS`, x + 220, 1130);
  }
  ctx.font = 'bold 120px sans-serif'; ctx.fillText(`${stats.home.goals} × ${stats.away.goals}`, 540, 1460);
  ctx.font = '32px sans-serif'; ctx.fillText('AMISTOSO · FORA DO RANKING GLOBAL', 540, 1650);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw new Error('Imagem indisponível.');
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sumula-fc-duelo.png'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}