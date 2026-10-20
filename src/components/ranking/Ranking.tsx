import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Swords, Trophy } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DuelList } from '@/components/duel/DuelList';
import { accountQuery } from '@/lib/app-queries';
import { GlobalRanking } from './GlobalRanking';
import { RankingSkeleton } from './RankingSkeleton';

function DuelsPanel() {
  const { data } = useSuspenseQuery(accountQuery());
  return <><DuelList uid={data.user.id}/><DuelList uid={data.user.id} finishedOnly/></>;
}

export function RankingPage() {
  return <AppShell title="Ranking">
    <Tabs defaultValue="global">
      <TabsList aria-label="Ranking e duelos" className="mb-5 grid h-12 w-full grid-cols-2 border bg-card">
        <TabsTrigger value="global" className="h-full gap-2 data-[state=active]:text-primary"><Trophy className="size-4"/>Ranking Global</TabsTrigger>
        <TabsTrigger value="duels" className="h-full gap-2 data-[state=active]:text-primary"><Swords className="size-4"/>Duelos X1</TabsTrigger>
      </TabsList>
      <TabsContent value="global"><Suspense fallback={<RankingSkeleton/>}><GlobalRanking/></Suspense></TabsContent>
      <TabsContent value="duels"><Suspense fallback={<p role="status" className="py-8 text-sm text-muted-foreground">Carregando seus duelos…</p>}><DuelsPanel/></Suspense></TabsContent>
    </Tabs>
  </AppShell>;
}