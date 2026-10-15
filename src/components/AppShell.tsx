import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BarChart3, Home, User, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ title, back, children, action }: { title?: string; back?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="theme-cream min-h-screen pb-28">
      <header className="border-b bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-5">
        <div className="flex items-center gap-3">
          {back}
          {title ? (
            <h1 className="text-3xl leading-none">{title}</h1>
          ) : (
             <Link to="/home" className="font-display text-2xl uppercase">Súmula <span className="rounded bg-primary px-1.5 text-primary-foreground">FC</span></Link>
          )}
        </div>
        {action}
      </div></header>
      <main className="mx-auto max-w-3xl px-5 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/home", label: "Início", icon: Home },
    { to: "/results", label: "Resultados", icon: BarChart3 },
    { to: "/ranking", label: "Ranking", icon: Trophy },
    { to: "/profile", label: "Perfil", icon: User },
  ] as const;
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 border-t bg-ink px-4 pb-3 pt-2 text-ink-foreground">
      <div className="mx-auto flex max-w-md items-center justify-around p-2">
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 text-[10px] font-bold opacity-70 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
            activeProps={{ className: "bg-primary text-primary-foreground !opacity-100" }}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function Avatar({ name, size = 40, ring }: { name: string; size?: number; ring?: boolean }) {
  const initials = name.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-display text-primary ${ring ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
      {initials}
    </span>
  );
}

export function OvrBadge({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`inline-flex min-w-10 items-center justify-center rounded-lg bg-primary px-2 py-1 font-display text-lg leading-none text-primary-foreground ${className}`}>{value}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border bg-card p-5 ${className}`}>{children}</section>;
}

export function BackHome() {
  return <Button asChild variant="ghost" size="icon" aria-label="Voltar ao início"><Link to="/home"><ArrowLeft /></Link></Button>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-end justify-between">
      <h2 className="text-xl">{children}</h2>
      {right}
    </div>
  );
}
