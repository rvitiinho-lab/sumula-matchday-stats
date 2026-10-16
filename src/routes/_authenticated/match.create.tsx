import { createFileRoute } from '@tanstack/react-router';
import { AppShell, BackHome } from '@/components/AppShell';
import { CreateMatchForm } from '@/components/match/CreateMatchForm';
import { pageHead } from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/match/create')({head:()=>pageHead('Criar pelada','Defina a modalidade, data e local e compartilhe sua pelada no WhatsApp.'),component:CreateMatch});
function CreateMatch(){return <AppShell title="Nova pelada" back={<BackHome/>}><h1 className="mb-6 text-4xl">Criar pelada</h1><CreateMatchForm/></AppShell>;}
