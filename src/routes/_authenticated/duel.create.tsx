import { createFileRoute } from '@tanstack/react-router';
import { AppShell, BackHome } from '@/components/AppShell';
import { PageError } from '@/components/MatchUI';
import { CreateDuel } from '@/components/duel/CreateDuel';
import { duelOpponentsQuery } from '@/lib/duel-queries';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/duel/create')({ head: () => pageHead('Novo Duelo 1v1', 'Escolha um atleta acompanhado e registre um duelo amistoso com confirmação dos dois jogadores.'), loader: ({ context }) => context.queryClient.ensureQueryData(duelOpponentsQuery()), component: () => <AppShell title="Novo duelo" back={<BackHome/>}><CreateDuel/></AppShell>, errorComponent: PageError });