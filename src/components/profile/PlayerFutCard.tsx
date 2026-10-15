import { Shield, Star } from "lucide-react";
import type { FutProfile } from "@/lib/profile-card";
export function PlayerFutCard({ profile }: { profile: FutProfile }) {
  return <article className="fut-card mx-auto w-full max-w-sm" aria-label={`Carta de ${profile.apelido}`}>
    <div className="flex items-start justify-between"><div><p className="font-display text-7xl leading-none text-primary">{profile.overall_rating ?? 70}</p><p className="mt-2 text-xs font-extrabold text-muted-foreground">OVR</p><span className="mt-4 inline-block rounded border border-primary/40 bg-primary/10 px-3 py-1 font-display text-xl text-primary">{profile.position}</span></div><Shield className="size-7 text-primary" /></div>
    <div className="fut-avatar mx-auto -mt-10 flex size-28 items-center justify-center rounded-full border-2 border-primary bg-background font-display text-5xl text-primary" aria-label="Avatar do atleta">{profile.apelido.slice(0, 2).toUpperCase()}</div>
    <div className="mt-7 text-center"><div className="mb-3 flex justify-center gap-2 text-primary">{[0,1,2].map(i => <Star key={i} className="size-3" />)}</div><h2 className="break-words text-4xl leading-tight">{profile.apelido}</h2><p className="mt-2 break-words text-sm text-muted-foreground">{profile.nome}</p></div>
    <div className="mt-6 border-t border-primary/25 pt-4 text-center"><p className="text-[10px] font-extrabold text-primary">SÚMULA FC · ATLETA</p>{profile.quote && <p className="mt-3 break-words text-sm leading-relaxed">“{profile.quote}”</p>}</div>
  </article>;
}