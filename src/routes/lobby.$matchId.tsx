import { createFileRoute } from '@tanstack/react-router';
import { MatchLobby } from '@/components/match/MatchLobby';
import { PageError, PageMissing } from '@/components/MatchUI';
import { matchQuery } from '@/lib/app-queries';
import { pageHead } from '@/lib/page-head';
export const Route=createFileRoute('/lobby/$matchId')({head:()=>pageHead('Lobby da pelada','Confirme presença, acompanhe a fila e participe da resenha da sua pelada.'),loader:({context,params})=>context.queryClient.ensureQueryData(matchQuery(params.matchId)),component:Lobby,errorComponent:PageError,notFoundComponent:PageMissing});
function Lobby(){const {matchId}=Route.useParams();return <MatchLobby matchId={matchId}/>;}
