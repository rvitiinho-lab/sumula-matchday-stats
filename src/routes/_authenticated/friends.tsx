import { createFileRoute } from '@tanstack/react-router';
import { AppShell,BackHome } from '@/components/AppShell';
import { FriendTracker } from '@/components/social/FriendTracker';
import { PageError } from '@/components/MatchUI';
import { socialQuery } from '@/lib/module-queries';
import { pageHead } from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/friends')({head:()=>pageHead('Acompanhar Amigos','Acompanhe atletas e times, veja o raio-X e compare desempenhos registrados.'),loader:({context})=>context.queryClient.ensureQueryData(socialQuery()),component:()=> <AppShell title="Acompanhar Amigos" back={<BackHome/>}><FriendTracker/></AppShell>,errorComponent:PageError});
