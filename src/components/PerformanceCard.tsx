import { useState } from "react";
import { Download, Save, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar } from "./AppShell";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { MatchRow } from "@/lib/match-data";
import { downloadPlayerCard } from "@/lib/share-card";
import { fmtPoints, messageValid, statKeys, STAT_LABELS, WEIGHTS, type Award, type Performance } from "@/lib/performance";

export function AwardState({ award, title }: { award: Award; title: string }) {
  return <div className="border-y py-6"><p className="font-display text-2xl">{title} não definido — {award.status === "tie" ? "empate" : "registros insuficientes"}</p>{award.status === "tie" && <p className="mt-2 text-sm text-muted-foreground">{award.leaders.map(r => `${r.player.profile?.apelido ?? "Atleta"} (${fmtPoints(r.points)} pontos)`).join(" · ")}</p>}</div>;
}
export function PerformanceCard({ row, match, title, root, message = "", canWrite = false }: { row: Performance; match: MatchRow; title?: string; root?: string; message?: string; canWrite?: boolean }) {
  const { player } = row;
  const [draft, setDraft] = useState(message);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const save = async () => {
    if (!root || !canWrite || !messageValid(draft)) return;
    setBusy(true);
    const { error } = await supabase.from("pelada_messages").upsert({ pelada_id: root, player_id: player.player_id, message: draft });
    setBusy(false);
    if (error) return void toast.error("Não foi possível salvar o recado");
    await qc.invalidateQueries({ queryKey: ["pelada"] });
    toast.success("Recado salvo!");
  };
  return <article className={`min-w-0 rounded-lg border p-5 sm:p-6 ${title ? "border-primary bg-ink text-ink-foreground" : "border-cream-foreground/20 bg-cream text-cream-foreground"}`}>
    <header className="flex items-center justify-between gap-3 border-b border-current/20 pb-3"><p className="font-display text-lg">SÚMULA FC</p><span className="text-[10px] font-bold uppercase">{title ? "Edição especial" : `Rodada ${match.round_number}`}</span></header>
    {title && <p className="mt-5 flex items-center gap-2 font-display text-2xl text-primary"><Trophy className="size-6"/>{title}</p>}
    <div className="mt-5 flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="break-words text-4xl">{player.profile?.apelido ?? "Atleta"}</h3><p className="mt-2 text-xs opacity-70">{player.profile?.position} · Overall {player.profile?.overall_rating ?? 70}</p></div><Avatar name={player.profile?.apelido ?? "Atleta"} size={56}/></div>
    <div className="mt-5 flex items-end gap-3"><p className={`font-display text-6xl leading-none ${title ? "text-primary" : ""}`}>{fmtPoints(row.points)}</p><p className="pb-1 text-xs font-bold uppercase">Pontos<br/>de desempenho</p></div>
    <div className="mt-5 grid grid-cols-4 gap-2 border-y border-current/20 py-4">{[[player.goals,"Gols"],[player.assists,"Assist."],[player.tackles,"Desarmes"],[player.saves+player.difficult_saves,"Defesas"]].map(([value,label]) => <div key={label}><p className="font-display text-2xl">{value}</p><p className="text-[9px] font-bold uppercase">{label}</p></div>)}</div>
    <dl className="mt-4 space-y-1 text-xs">{statKeys.filter(k => player[k] > 0).map(k => <div className="flex justify-between gap-3" key={k}><dt>{k === "victory_points" ? `${player[k]/2} × Vitória` : `${player[k]} × ${STAT_LABELS[k]}`}</dt><dd className="shrink-0 font-bold">{WEIGHTS[k] > 0 ? "+" : ""}{fmtPoints(player[k]*WEIGHTS[k])} pts</dd></div>)}</dl>
    {title === "Melhor da Noite" && <p className="mt-4 text-sm font-bold">{row.mvps} MVP{row.mvps === 1 ? "" : "s"} conquistado{row.mvps === 1 ? "" : "s"}</p>}
    {message && <blockquote className="mt-5 break-words border-l-2 border-primary pl-3 text-sm">“{message}”</blockquote>}
    {canWrite && <div className="mt-5"><label htmlFor={`recado-${title}-${match.id}`} className="text-xs font-bold">Seu recado</label><textarea id={`recado-${title}-${match.id}`} value={draft} onChange={e => setDraft(e.target.value)} maxLength={120} rows={3} className="mt-2 w-full resize-none rounded border bg-cream p-3 text-sm text-cream-foreground"/><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs opacity-70">{Array.from(draft).length}/120</span><Button variant="secondary" disabled={busy || !messageValid(draft) || draft === message} onClick={save}><Save/>Salvar recado</Button></div></div>}
    <Button variant={title ? "default" : "secondary"} className="mt-5 w-full" onClick={async () => { try { await downloadPlayerCard(player, match, title ? { title, points: row.points, message } : undefined); toast.success("Card salvo!"); } catch { toast.error("Não foi possível salvar o card"); } }}><Download/>Salvar card</Button>
  </article>;
}