// Executes the production migration in isolated PostgreSQL, never in the hosted database.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
const creator = '11111111-1111-4111-8111-111111111111';
const opponent = '22222222-2222-4222-8222-222222222222';
const outsider = '33333333-3333-4333-8333-333333333333';
let db: PGlite;
const statistics = { home: { goals: 2, assists: 0, tackles: 3, saves: 1 }, away: { goals: 1, assists: 0, tackles: 1, saves: 4 } };
const identity = async (id: string) => { await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [id]); };
const create = async () => { await identity(creator); const r = await db.query<{ id: string }>('SELECT public.create_duel($1) AS id', [opponent]); return r.rows[0]?.id ?? ''; };
const action = (id: string, name: string, revision: number, stats: unknown = null, reason: string | null = null) => db.query('SELECT public.operate_duel($1,$2,$3,$4::jsonb,$5)', [id, name, revision, stats ? JSON.stringify(stats) : null, reason]);
const row = async (id: string) => (await db.query<{ status: string; revision: number; confirmed_revision: number | null; statistics: typeof statistics; finished_at: string | null }>('SELECT * FROM public.duels WHERE id=$1', [id])).rows[0];
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; GRANT USAGE ON SCHEMA auth TO authenticated; CREATE TABLE public.profiles(id uuid PRIMARY KEY); CREATE TABLE public.player_follows(follower_id uuid,player_id uuid); INSERT INTO public.profiles VALUES('${creator}'),('${opponent}'),('${outsider}'); INSERT INTO public.player_follows VALUES('${creator}','${opponent}');`);
  await db.exec(readFileSync('drizzle/migrations/0013_duel_confirmation_workflow.sql', 'utf8'));
}, 30000);
afterAll(async () => { await db?.close(); });
describe('Duelo: autorização e revisão no PostgreSQL', () => {
  it('confirma apenas a revisão reenviada após contestação e correção', async () => {
    const id = await create(); await action(id, 'SUBMIT', 0, statistics);
    expect((await row(id))?.status).toBe('PENDING_APPROVAL'); expect((await row(id))?.finished_at).toBeNull();
    await identity(opponent); await action(id, 'DISPUTE', 1, null, 'Meu gol não foi registrado.');
    expect((await row(id))?.status).toBe('DISPUTED');
    await expect(action(id, 'CONFIRM', 2)).rejects.toThrow();
    await identity(creator); const corrected = { ...statistics, away: { ...statistics.away, goals: 2 } }; await action(id, 'SUBMIT', 2, corrected);
    expect((await row(id))?.confirmed_revision).toBeNull(); expect((await row(id))?.finished_at).toBeNull();
    await identity(opponent); await expect(action(id, 'CONFIRM', 1)).rejects.toThrow('Os números mudaram'); await action(id, 'CONFIRM', 3);
    const final = await row(id); expect(final?.status).toBe('FINISHED'); expect(final?.confirmed_revision).toBe(3); expect(final?.statistics.away.goals).toBe(2); expect(final?.finished_at).not.toBeNull();
    await identity(creator); await expect(action(id, 'SAVE', 3, statistics)).rejects.toThrow('já confirmado');
  });
  it('criador não pode aprovar o próprio placar', async () => { const id = await create(); await action(id, 'SUBMIT', 0, statistics); await expect(action(id, 'CONFIRM', 1)).rejects.toThrow('Somente o desafiado'); });
  it('desafiado não pode alterar números', async () => { const id = await create(); await identity(opponent); await expect(action(id, 'SAVE', 0, statistics)).rejects.toThrow('Apenas o criador'); });
  it('terceiros não podem operar o duelo', async () => { const id = await create(); await identity(outsider); await expect(action(id, 'SUBMIT', 0, statistics)).rejects.toThrow('indisponível'); });
  it('só permite selecionar atleta seguido e não o próprio criador', async () => { await identity(creator); await expect(db.query('SELECT public.create_duel($1)', [outsider])).rejects.toThrow('acompanha'); await expect(db.query('SELECT public.create_duel($1)', [creator])).rejects.toThrow('acompanha'); });
  it('bloqueia alteração enquanto aguarda confirmação', async () => { const id = await create(); await action(id, 'SUBMIT', 0, statistics); await expect(action(id, 'SAVE', 1, statistics)).rejects.toThrow('nesta etapa'); });
  it('recusa contadores negativos', async () => { const id = await create(); await expect(action(id, 'SAVE', 0, { ...statistics, home: { ...statistics.home, goals: -1 } })).rejects.toThrow('inteiros'); });
  it('recusa contestação sem descrição', async () => { const id = await create(); await action(id, 'SUBMIT', 0, statistics); await identity(opponent); await expect(action(id, 'DISPUTE', 1, null, '')).rejects.toThrow('Descreva'); });
  it('RLS oculta duelo de terceiros e grants impedem edição direta', async () => {
    const id = await create(); await identity(outsider); await db.exec('SET ROLE authenticated');
    try { expect((await db.query('SELECT * FROM public.duels WHERE id=$1', [id])).rows).toHaveLength(0); await expect(db.query("UPDATE public.duels SET status='FINISHED' WHERE id=$1", [id])).rejects.toThrow('permission denied'); } finally { await db.exec('RESET ROLE'); }
  });
});