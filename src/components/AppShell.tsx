import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BarChart3, Home, User } from "lucide-react";

export function AppShell({ title, back, children, action }: { title?: string; back?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="theme-cream min-h-screen pb-28">
      <header className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 pt-6 pb-3">
        <div className="flex items-center gap-3">
          {back}
          {title ? (
            <h1 className="text-3xl leading-none">{title}</h1>
          ) : (
            <Link to="/home" className="font-display text-2xl uppercase tracking-wide">Súmula <span className="rounded bg-ink px-1.5 text-primary">FC</span></Link>
          )}
        </div>
        {action}
      </header>
      <main className="mx-auto max-w-2xl px-5">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/home", label: "Início", icon: Home },
    { to: "/results", label: "Resultados", icon: BarChart3 },
    { to: "/profile", label: "Perfil", icon: User },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-full bg-ink p-2 text-ink-foreground shadow-xl">
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-bold opacity-70"
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
  return <section className={`rounded-3xl border bg-card p-5 ${className}`}>{children}</section>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-end justify-between">
      <h2 className="text-xl">{children}</h2>
      {right}
    </div>
  );
}
