import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { AppShell, SectionTitle } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { PageError, PageMissing } from '@/components/MatchUI';
import { PlayerFutCard } from '@/components/profile/PlayerFutCard';
import { RankingSkeleton } from '@/components/ranking/RankingSkeleton';
import { competitiveRankingQuery, formatCompetitiveScore } from '@/hooks/useCompetitiveRanking';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/athlete/$playerId')({ head: () => pageHead('Perfil do atleta', 'Carta, estatísticas reais e classificação competitiva do atleta no Súmula FC.'), loader: ({ context }) => context.queryClient.ensureQueryData(competitiveRankingQuery()), pendingComponent: () => <AppShell title="Atleta"><RankingSkeleton/></AppShell>, errorComponent: PageError, component: Athlete });
function Athlete() {
  const { playerId } = Route.useParams();
  const { data } = useSuspenseQuery(competitiveRankingQuery());
  const p = data.players.find(row => row.id === playerId);
  if (!p) return <PageMissing/>;
  return <AppShell title="Perfil do atleta" back={<Button asChild variant="ghost" size="icon" aria-label="Voltar ao ranking"><Link to="/ranking"><ArrowLeft/></Link></Button>}><PlayerFutCard profile={{ nome: p.name, apelido: p.nickname, position: p.role, quote: p.quote, overall_rating: p.overall }}/><SectionTitle>Desempenho competitivo</SectionTitle><div className="grid grid-cols-2 gap-3"><article className="profile-stat"><p className="text-xs text-muted-foreground">POSIÇÃO</p><p className="mt-4 font-display text-3xl">{p.position ? `${p.position}º` : 'Em qualificação'}</p></article><article className="profile-stat"><p className="text-xs text-muted-foreground">PONTOS COMPETITIVOS</p><p className="mt-4 font-display text-3xl text-primary">{formatCompetitiveScore(p.score)}</p></article></div><p className="mt-4 text-xs text-muted-foreground">{p.peladas}/5 peladas válidas · {p.valid_rounds} rodadas válidas</p><SectionTitle>Estatísticas da carreira</SectionTitle><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[[p.games,'Jogos'],[p.goals,'Gols'],[p.assists,'Assistências'],[p.tackles,'Desarmes'],[p.saves,'Defesas'],[p.mvps,'MVPs']].map(([value,label]) => <article key={label} className="profile-stat"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-4 font-display text-4xl">{value}</p></article>)}</div></AppShell>;
}