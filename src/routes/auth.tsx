import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { signInGoogle } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Súmula FC" },
      { name: "description", content: "Entre na sua conta de atleta do Súmula FC." },
      { property: "og:title", content: "Entrar — Súmula FC" },
      { property: "og:description", content: "Entre na sua conta de atleta do Súmula FC." },
    ],
  }),
  component: AuthLayout,
});

function AuthLayout() {
  const { pathname } = useLocation();
  return pathname === "/auth" || pathname === "/auth/" ? <Login /> : <Outlet />;
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Shell>
      <div className="mx-auto mt-10 max-w-md rounded-2xl bg-card p-8">
        <h1 className="text-4xl">Entrar</h1>
        <form
          className="mt-6 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault(); setBusy(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            setBusy(false);
            if (error) return toast.error("E-mail ou senha incorretos");
            navigate({ to: "/" });
          }}
        >
          <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={busy} className="pill justify-center bg-primary text-primary-foreground disabled:opacity-60">Entrar</button>
        </form>
        <button className="pill mt-3 justify-center border" onClick={() => signInGoogle()}>Entrar com Google</button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Novo por aqui? <Link to="/auth/register" className="font-bold text-primary">Criar cadastro de atleta</Link>
        </p>
      </div>
    </Shell>
  );
}
