import type { MatchPlayer, MatchRow } from "./match-data";
export async function downloadPlayerCard(player: MatchPlayer, match: MatchRow) {
  const canvas=document.createElement("canvas"); canvas.width=720;canvas.height=960;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Imagem indisponível");
  const theme=getComputedStyle(document.documentElement);
  ctx.fillStyle=theme.getPropertyValue("--cream").trim();ctx.fillRect(0,0,720,960);
  ctx.fillStyle=theme.getPropertyValue("--cream-foreground").trim();
  ctx.font="bold 32px sans-serif";ctx.fillText("SÚMULA FC · RESENHA",48,72);
  ctx.font="bold 144px sans-serif";ctx.fillText(String(player.profile?.overall_rating??70),48,230);
  ctx.font="bold 24px sans-serif";ctx.fillText(`${player.profile?.position||"MEI"} · ${player.team==="colete"?"COLETE":"SEM COLETE"}`,48,277);
  const nickname=player.profile?.apelido||"Atleta";
  let fontSize=62;ctx.font=`bold ${fontSize}px sans-serif`;
  while(ctx.measureText(nickname).width>620&&fontSize>22){fontSize-=2;ctx.font=`bold ${fontSize}px sans-serif`;}
  ctx.fillText(nickname,48,395);
  ctx.font="28px sans-serif";ctx.fillText(player.profile?.nome?.slice(0,34)||"",48,444);
  ctx.font="bold 42px sans-serif";ctx.fillText(`${player.goals} GOLS`,48,550);ctx.fillText(`${player.assists} ASSIST.`,360,550);ctx.fillText(`${player.saves} DEFESAS`,48,624);ctx.fillText(`${player.tackles} DESARMES`,360,624);
  ctx.font="24px sans-serif";
  const words=(player.profile?.quote||"Hoje a bola veio redonda.").split(" ");let line="",y=720;
  for(const word of words){if(ctx.measureText(`${line} ${word}`).width>610){ctx.fillText(line,48,y);line=word;y+=34;}else line+=`${line?" ":""}${word}`;}ctx.fillText(line,48,y);
  ctx.font="bold 30px sans-serif";ctx.fillText(`Colete ${match.score_team_a??0} × ${match.score_team_b??0} Sem colete`,48,864);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png"));if(!blob)throw new Error("Imagem indisponível");
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`sumula-fc-${nickname}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
