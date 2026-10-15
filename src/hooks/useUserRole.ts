import { useQuery } from '@tanstack/react-query';
import { useSession } from './use-session';
import { roleQuery } from '@/lib/module-queries';
import { permissions } from '@/lib/modules';
import type { MatchRow } from '@/lib/match-data';
export function useUserRole(match:MatchRow|null|undefined){const {user}=useSession();const root=match?.pelada_id??match?.id??'';const query=useQuery({...roleQuery(root),enabled:!!user&&!!root,refetchInterval:5000});const role=match?.creator_id===user?.id&&user?'ADMIN':query.data?.some(r=>r.user_id===user?.id)?'MESARIO':'PLAYER';return {role, ...permissions(role),user,roles:query.data??[]};}
