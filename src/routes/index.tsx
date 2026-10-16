import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, Tag } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { JoinByCode } from "@/components/home/JoinByCode";
import { useSession } from "@/hooks/use-session";

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

export { parseLobbyCode } from '@/lib/lobby-code';

function Home() {
  const navigate = useNavigate();
  const { user } = useSession();
  useEffect(() => { if (user) navigate({ to: "/home", replace: true }); }, [user, navigate]);

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

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 text-left">
          <JoinByCode />
          <div className="mt-2 flex gap-3">
            <Button asChild className="flex-1" size="lg"><Link to="/auth">Login</Link></Button>
            <Button asChild variant="secondary" className="flex-1" size="lg"><Link to="/auth/register">Cadastrar-se</Link></Button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
