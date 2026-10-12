import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({
    meta: [
      { title: "Resultados — Súmula FC" },
      { name: "description", content: "Resultados do seu app Súmula FC." },
      { property: "og:title", content: "Resultados — Súmula FC" },
      { property: "og:description", content: "Resultados do seu app Súmula FC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  return (
    <AppShell title="Resultados">
      <Card><p className="text-muted-foreground">Em construção.</p></Card>
    </AppShell>
  );
}
