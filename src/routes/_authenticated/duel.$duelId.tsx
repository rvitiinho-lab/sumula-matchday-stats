import { createFileRoute } from '@tanstack/react-router';
import { AppShell, BackHome } from '@/components/AppShell';
import { PageError } from '@/components/MatchUI';
import { DuelScreen } from '@/components/duel/DuelScreen';
import { duelQuery } from '@/lib/duel-queries';
import { accountQuery } from '@/lib/app-queries';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/duel/$duelId')({ head: () => pageHead('Súmula do Duelo', 'Placar, estatísticas e confirmação do Duelo 1v1 entre os atletas.'), loader: async ({ context, params }) => { await Promise.all([context.queryClient.ensureQueryData(duelQuery(params.duelId)), context.queryClient.ensureQueryData(accountQuery())]); }, component: Page, errorComponent: PageError });
function Page() { const { duelId } = Route.useParams(); return <AppShell title="Súmula do Duelo" back={<BackHome/>}><DuelScreen id={duelId}/></AppShell>; }