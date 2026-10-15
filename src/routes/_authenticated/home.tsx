import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home/Home';
import { PageError, PageMissing } from '@/components/MatchUI';
import { accountQuery } from '@/lib/app-queries';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/home')({ head: () => pageHead('Início', 'Sua próxima pelada, evolução pessoal e destaques reais na Gazeta da Resenha.'), loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery()), component: HomePage, errorComponent: PageError, notFoundComponent: PageMissing });
