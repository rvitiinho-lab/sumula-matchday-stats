import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Início — Súmula FC" },
      { name: "description", content: "Início do seu app Súmula FC." },
      { property: "og:title", content: "Início — Súmula FC" },
      { property: "og:description", content: "Início do seu app Súmula FC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell title="Início">
      <Card><p className="text-muted-foreground">Em construção.</p></Card>
    </AppShell>
  );
}
