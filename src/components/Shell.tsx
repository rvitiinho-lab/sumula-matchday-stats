import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export function Shell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link to="/" className="font-display text-2xl uppercase tracking-wide">
          Súmula <span className="text-primary">FC</span>
        </Link>
        {user ? (
          <button
            className="rounded-full border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }}
          >
            Sair
          </button>
        ) : (
          <Link to="/auth" className="rounded-full border px-4 py-2 text-sm font-semibold hover:border-primary">
            Entrar
          </Link>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-20">{children}</main>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
      {children}
    </span>
  );
}
