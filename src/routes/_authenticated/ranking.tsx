import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { GlobalRanking } from '@/components/ranking/GlobalRanking';
import { RankingSkeleton } from '@/components/ranking/RankingSkeleton';
import { competitiveRankingQuery } from '@/hooks/useCompetitiveRanking';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/ranking')({
  head: () => pageHead('Ranking Global', 'Classificação competitiva, progresso de qualificação e desempenho real dos atletas do Súmula FC.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(competitiveRankingQuery()),
  pendingComponent: () => <AppShell title="Ranking Global"><RankingSkeleton/></AppShell>,
  errorComponent: ({ reset }) => <AppShell title="Ranking Global"><section className="py-12"><h2 className="text-2xl">O ranking não carregou</h2><p className="mt-3 text-sm text-muted-foreground">Tente consultar a classificação novamente.</p><Button className="mt-5" onClick={reset}>Tentar novamente</Button></section></AppShell>,
  component: () => <AppShell title="Ranking Global"><GlobalRanking/></AppShell>,
});