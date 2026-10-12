import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Súmula FC" },
      { name: "description", content: "Perfil do seu app Súmula FC." },
      { property: "og:title", content: "Perfil — Súmula FC" },
      { property: "og:description", content: "Perfil do seu app Súmula FC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell title="Perfil">
      <Card><p className="text-muted-foreground">Em construção.</p></Card>
    </AppShell>
  );
}
