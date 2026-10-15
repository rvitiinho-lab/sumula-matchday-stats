import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Save, LogOut, Download, Trophy, Target, Hand, Shield, Footprints, CalendarDays, LockKeyhole, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { PageError, PageMissing } from "@/components/MatchUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerFutCard } from "@/components/profile/PlayerFutCard";
import { careerAchievements, type CareerStats } from "@/lib/profile-achievements";
import { exportProfileCard } from "@/lib/profile-card";
import { accountQuery } from "@/lib/app-queries";
import { POSITIONS } from "@/lib/match-data";
import { pageHead } from "@/lib/page-head";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/profile")({ head: () => pageHead("Meu perfil de atleta", "Sua carta Súmula FC, estatísticas reais, conquistas e frase da resenha."), loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery()), component: ProfilePage, errorComponent: PageError, notFoundComponent: PageMissing });
function ProfilePage() {
  const { data } = useSuspenseQuery(accountQuery());
  const [nome, setNome] = useState(data.profile.nome), [apelido, setApelido] = useState(data.profile.apelido), [position, setPosition] = useState(data.profile.position), [quote, setQuote] = useState(data.profile.quote || "");
  const [busy, setBusy] = useState(false), [exporting, setExporting] = useState(false);
  const qc = useQueryClient(), navigate = useNavigate();
  const finished = data.stats.filter(s => s.match?.status === "finished");
  const total = (key: "goals" | "assists" | "saves" | "difficult_saves" | "tackles") => finished.reduce((s, p) => s + (p[key] ?? 0), 0);
  const stats: CareerStats = { games: finished.length, goals: total("goals"), assists: total("assists"), saves: total("saves") + total("difficult_saves"), tackles: total("tackles"), mvps: data.mvps };
  const achievements = careerAchievements(stats), unlocked = achievements.filter(a => a.unlocked).length;
  const metrics = [{ key: "games", label: "Jogos", icon: CalendarDays }, { key: "goals", label: "Gols", icon: Target }, { key: "assists", label: "Assistências", icon: Footprints }, { key: "saves", label: "Defesas", icon: Hand }, { key: "tackles", label: "Desarmes", icon: Shield }, { key: "mvps", label: "MVPs", icon: Trophy }] as const;
  return <AppShell title="Meu perfil">
    <section className="pb-8 pt-2">
      <div className="mb-6 flex items-center justify-between gap-3"><p className="text-xs font-extrabold uppercase text-muted-foreground">Minha carta de atleta</p><span className="text-xs font-bold text-primary">SÚMULA FC</span></div>
      <PlayerFutCard profile={{ ...data.profile, quote }} />
      <Button className="sport-action mx-auto mt-5 flex w-full max-w-sm" disabled={exporting} onClick={async () => { setExporting(true); try { await exportProfileCard({ ...data.profile, quote }, stats); } catch { toast.error("Não foi possível exportar sua carta."); } finally { setExporting(false); } }}><Download />{exporting ? "Preparando carta…" : "Exportar carta para Stories"}</Button>
    </section>
    <SectionTitle>Estatísticas da carreira</SectionTitle>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{metrics.map(({ key, label, icon: Icon }) => <article className="profile-stat" key={key}><div className="flex items-center justify-between gap-2"><Icon className="size-4 text-primary" /><span className="text-[10px] font-extrabold uppercase text-muted-foreground">{label}</span></div><p className="mt-4 font-display text-4xl leading-none">{stats[key]}</p></article>)}</div>
    <SectionTitle right={<span className="text-xs font-bold text-primary">{unlocked}/{achievements.length}</span>}>Galeria de conquistas</SectionTitle>
    <div className="grid gap-3 sm:grid-cols-2">{achievements.map((a, i) => { const Icon = [Footprints, CalendarDays, Target, Hand, Trophy][i] ?? Trophy; return <article key={a.id} className={`flex items-center gap-4 rounded-lg border bg-card p-4 ${a.unlocked ? "border-primary/40" : "opacity-60"}`}><div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${a.unlocked ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}><Icon className="size-5" /></div><div className="min-w-0 flex-1"><h3 className="text-base">{a.title}</h3><p className="mt-1 text-xs text-muted-foreground">{a.unlocked ? "Conquista desbloqueada" : a.criterion}</p><progress aria-label={`Progresso de ${a.title}`} className="mt-2 h-1 w-full accent-primary" max={a.target} value={a.progress} /></div>{a.unlocked ? <Check className="size-4 shrink-0 text-primary" /> : <LockKeyhole className="size-4 shrink-0 text-muted-foreground" />}</article>; })}</div>
    <SectionTitle>Dados do atleta</SectionTitle>
    <form className="space-y-5" onSubmit={async e => {
      e.preventDefault(); if (nome.trim().length < 3 || !/^\w{2,20}$/.test(apelido)) return void toast.error("Confira seu nome e apelido (2 a 20 caracteres, sem espaços).");
      setBusy(true); const { error } = await supabase.from("profiles").update({ nome: nome.trim(), apelido, position, quote: quote.trim().slice(0, 120) || null }).eq("id", data.user.id); setBusy(false);
      if (error) return void toast.error("Não foi possível salvar. Confira se o apelido já está em uso.");
      await qc.invalidateQueries({ queryKey: ["account"] }); toast.success("Perfil atualizado!");
    }}>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Nome completo<Input className="mt-2 h-12" value={nome} onChange={e => setNome(e.target.value)} required maxLength={100} /></label><label className="block text-sm font-bold">Apelido<Input className="mt-2 h-12" value={apelido} onChange={e => setApelido(e.target.value)} required maxLength={20} /></label></div>
      <label className="block text-sm font-bold">E-mail<Input className="mt-2 h-12" value={data.user.email || ""} disabled /></label>
      <fieldset><legend className="mb-3 text-sm font-bold">Posição principal</legend><div className="flex flex-wrap gap-2">{POSITIONS.map(p => <Button className="min-w-14 rounded-full font-extrabold" type="button" aria-pressed={position === p} key={p} variant={position === p ? "default" : "secondary"} onClick={() => setPosition(p)}>{p}</Button>)}</div></fieldset>
      <label className="block text-sm font-bold"><span className="flex justify-between gap-3">Frase da resenha<span className="text-xs font-normal text-muted-foreground">{quote.length}/120</span></span><Input className="mt-2 h-12" value={quote} onChange={e => setQuote(e.target.value)} maxLength={120} /></label>
      <Button disabled={busy} className="sport-action w-full"><Save />{busy ? "Salvando…" : "Salvar alterações"}</Button>
    </form>
    <Button variant="ghost" className="mt-5 w-full text-destructive" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) return void toast.error("Não foi possível sair"); qc.clear(); navigate({ to: "/" }); }}><LogOut />Sair da conta</Button>
  </AppShell>;
}
