import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Shell, Tag } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MODALITIES, type Modality } from "@/lib/draw";

export const Route = createFileRoute("/_authenticated/match/create")({
  head: () => ({
    meta: [
      { title: "Criar Pelada — Súmula FC" },
      { name: "description", content: "Escolha a modalidade e abra o lobby da sua pelada." },
      { property: "og:title", content: "Criar Pelada — Súmula FC" },
      { property: "og:description", content: "Escolha a modalidade e abra o lobby da sua pelada." },
    ],
  }),
  component: CreateMatch,
});

function CreateMatch() {
  const navigate = useNavigate();
  const [modality, setModality] = useState<Modality>("x5");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const info = MODALITIES.find((m) => m.id === modality)!;

  const create = async () => {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user!.id;
    const { data, error } = await supabase.from("matches")
      .insert({ creator_id: uid, modality, title: title.trim().slice(0, 60) || null }).select("id").single();
    if (error || !data) { setBusy(false); return void toast.error("Não foi possível criar a pelada"); }
    await supabase.from("match_players").insert({ match_id: data.id, player_id: uid, queue_position: 1 });
    navigate({ to: "/lobby/$matchId", params: { matchId: data.id } });
  };

  return (
    <Shell>
      <div className="mx-auto mt-6 max-w-xl">
        <Tag>Nova pelada</Tag>
        <h1 className="mt-4 text-5xl">Escolha a modalidade</h1>
        <Input className="mt-6" placeholder="Nome do racha (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {MODALITIES.map((m) => (
            <button
              key={m.id}
              onClick={() => setModality(m.id)}
              className={`rounded-2xl border-2 py-6 font-display text-4xl uppercase transition ${m.id === modality ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
            >
              {m.id}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lotação máxima</p>
          <p className="mt-1 font-display text-5xl text-primary">{info.max} <span className="text-2xl text-foreground">atletas</span></p>
          <p className="mt-2 text-sm text-muted-foreground">2 times titulares de {info.size} + até 3 times "Próxima" e lista de espera.</p>
        </div>
        <button disabled={busy} onClick={create} className="pill mt-6 bg-primary text-primary-foreground disabled:opacity-60">
          <span className="flex-1 text-left">Abrir lobby da pelada</span> <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </Shell>
  );
}
