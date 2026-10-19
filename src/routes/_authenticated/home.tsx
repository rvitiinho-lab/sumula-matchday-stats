import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home/Home';
import { PageError, PageMissing } from '@/components/MatchUI';
import { accountQuery } from '@/lib/app-queries';
import { pageHead } from '@/lib/page-head';
import { duelsQuery } from '@/lib/duel-queries';
export const Route = createFileRoute('/_authenticated/home')({ head: () => pageHead('Início', 'Sua próxima pelada, evolução pessoal e destaques reais na Gazeta da Resenha.'), loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(accountQuery()), context.queryClient.ensureQueryData(duelsQuery())]); }, component: HomePage, errorComponent: PageError, notFoundComponent: PageMissing });
