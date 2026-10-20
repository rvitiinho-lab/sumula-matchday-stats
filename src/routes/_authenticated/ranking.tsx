import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { RankingPage } from '@/components/ranking/Ranking';
import { RankingSkeleton } from '@/components/ranking/RankingSkeleton';
import { competitiveRankingQuery } from '@/hooks/useCompetitiveRanking';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/ranking')({
  head: () => pageHead('Ranking e Duelos X1', 'Classificação competitiva dos atletas e seus duelos X1 ativos e confirmados no Súmula FC.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(competitiveRankingQuery()),
  pendingComponent: () => <AppShell title="Ranking Global"><RankingSkeleton/></AppShell>,
  errorComponent: ({ reset }) => <AppShell title="Ranking Global"><section className="py-12"><h2 className="text-2xl">O ranking não carregou</h2><p className="mt-3 text-sm text-muted-foreground">Tente consultar a classificação novamente.</p><Button className="mt-5" onClick={reset}>Tentar novamente</Button></section></AppShell>,
  component: RankingPage,
});