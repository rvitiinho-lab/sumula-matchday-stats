import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Shell, Tag } from "@/components/Shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { signInGoogle, useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Súmula FC — A súmula oficial da sua resenha" },
      { name: "description", content: "Organize a pelada, registre cada lance e descubra quem decidiu a partida." },
      { property: "og:title", content: "Súmula FC — A súmula oficial da sua resenha" },
      { property: "og:description", content: "Organize a pelada, registre cada lance e descubra quem decidiu a partida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

export function parseLobbyCode(raw: string): string | null {
  const v = raw.trim();
  const m = v.match(/lobby\/([0-9a-f-]{36})/i) ?? v.match(/^([0-9a-f-]{36})$/i);
  return m ? m[1] : null;
}

function Home() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const go = () => {
    const id = parseLobbyCode(code);
    if (!id) return toast.error("Link ou código inválido");
    navigate({ to: "/lobby/$matchId", params: { matchId: id } });
  };

  return (
    <Shell>
      <section className="mx-auto max-w-2xl pt-10 text-center sm:pt-20">
        <Tag>A pelada, agora, tem história.</Tag>
        <h1 className="mt-6 text-5xl leading-[0.95] sm:text-7xl">
          A súmula oficial da sua <span className="text-primary">resenha.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
          Organize o jogo, registre cada lance e descubra quem realmente decidiu a partida.
        </p>

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
          <button className="pill bg-primary text-primary-foreground" onClick={() => navigate({ to: "/match/create" })}>
            <Plus className="h-5 w-5" /> <span className="flex-1 text-left">Criar minha Pelada</span> <ArrowRight className="h-5 w-5" />
          </button>
          <button className="pill bg-secondary" onClick={() => setOpen(true)}>
            <Link2 className="h-5 w-5 text-primary" /> <span className="flex-1 text-left">Inserir link ou código do racha</span> <ArrowRight className="h-5 w-5" />
          </button>
          {!user && (
            <button
              className="pill border bg-transparent"
              onClick={async () => { const r = await signInGoogle(); if (r.error) toast.error("Falha no login com Google"); }}
            >
              <span className="flex h-5 w-5 items-center justify-center font-display text-primary">G</span>
              <span className="flex-1 text-left">Entrar com Google</span> <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl uppercase">Entrar no racha</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); go(); }} className="flex flex-col gap-3">
            <Input autoFocus placeholder="sumulafc.app/lobby/... ou código" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="pill justify-center bg-primary text-primary-foreground">Ir para o lobby <ArrowRight className="h-4 w-4" /></button>
          </form>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
