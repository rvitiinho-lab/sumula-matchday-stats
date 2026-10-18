CREATE TABLE public.duels (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), creator_id uuid NOT NULL REFERENCES public.profiles(id), opponent_id uuid NOT NULL REFERENCES public.profiles(id), is_versus boolean NOT NULL DEFAULT true CHECK(is_versus), status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','PENDING_APPROVAL','DISPUTED','FINISHED')), statistics jsonb NOT NULL DEFAULT '{"home":{"goals":0,"assists":0,"tackles":0,"saves":0},"away":{"goals":0,"assists":0,"tackles":0,"saves":0}}', revision integer NOT NULL DEFAULT 0, confirmed_revision integer, dispute_reason text, created_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, CHECK(creator_id <> opponent_id), CHECK(status <> 'FINISHED' OR (confirmed_revision = revision AND finished_at IS NOT NULL))
);
GRANT SELECT ON public.duels TO authenticated;
GRANT ALL ON public.duels TO service_role;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read duels" ON public.duels FOR SELECT TO authenticated USING(auth.uid() IN (creator_id,opponent_id));
CREATE INDEX duels_creator_idx ON public.duels(creator_id,created_at DESC);
CREATE INDEX duels_opponent_idx ON public.duels(opponent_id,created_at DESC);
CREATE FUNCTION public.create_duel(_opponent uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta.'; END IF;
 IF _opponent = auth.uid() OR NOT EXISTS(SELECT 1 FROM public.player_follows WHERE follower_id=auth.uid() AND player_id=_opponent) THEN RAISE EXCEPTION 'Escolha outro atleta que você acompanha.'; END IF;
 INSERT INTO public.duels(creator_id,opponent_id) VALUES(auth.uid(),_opponent) RETURNING id INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.create_duel(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_duel(uuid) TO authenticated;
CREATE FUNCTION public.operate_duel(_duel uuid,_action text,_revision integer,_statistics jsonb DEFAULT NULL,_reason text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.duels; side text; stat text; v jsonb;
BEGIN
 SELECT * INTO d FROM public.duels WHERE id=_duel FOR UPDATE;
 IF NOT FOUND OR auth.uid() IS NULL OR auth.uid() NOT IN(d.creator_id,d.opponent_id) THEN RAISE EXCEPTION 'Duelo indisponível.'; END IF;
 IF d.revision <> _revision THEN RAISE EXCEPTION 'Os números mudaram. Atualize e confira novamente.'; END IF;
 IF d.status='FINISHED' THEN RAISE EXCEPTION 'Duelo já confirmado e encerrado.'; END IF;
 IF _action IN ('SAVE','SUBMIT') THEN
  IF auth.uid() <> d.creator_id OR d.status NOT IN ('IN_PROGRESS','DISPUTED') THEN RAISE EXCEPTION 'Apenas o criador pode registrar ou corrigir os números nesta etapa.'; END IF;
  IF _statistics IS NULL OR jsonb_typeof(_statistics) <> 'object' OR NOT (_statistics ?& ARRAY['home','away']) OR (SELECT count(*) FROM jsonb_object_keys(_statistics))<>2 THEN RAISE EXCEPTION 'Estatísticas inválidas.'; END IF;
  FOREACH side IN ARRAY ARRAY['home','away'] LOOP
   IF jsonb_typeof(_statistics->side)<>'object' OR NOT ((_statistics->side) ?& ARRAY['goals','assists','tackles','saves']) OR (SELECT count(*) FROM jsonb_object_keys(_statistics->side))<>4 THEN RAISE EXCEPTION 'Estatísticas incompletas.'; END IF;
   FOREACH stat IN ARRAY ARRAY['goals','assists','tackles','saves'] LOOP
    v := _statistics->side->stat;
    IF jsonb_typeof(v)<>'number' OR (v #>> '{}') !~ '^[0-9]+$' OR (v #>> '{}')::numeric > 1000 THEN RAISE EXCEPTION 'Use contadores inteiros entre 0 e 1000.'; END IF;
   END LOOP;
  END LOOP;
  UPDATE public.duels SET statistics=_statistics,revision=revision+1,confirmed_revision=NULL,status=CASE WHEN _action='SUBMIT' THEN 'PENDING_APPROVAL' ELSE d.status END WHERE id=_duel;
 ELSIF _action='DISPUTE' THEN
  IF auth.uid()<>d.opponent_id OR d.status<>'PENDING_APPROVAL' THEN RAISE EXCEPTION 'Somente o desafiado pode contestar os números enviados.'; END IF;
  IF length(trim(coalesce(_reason,''))) NOT BETWEEN 3 AND 500 THEN RAISE EXCEPTION 'Descreva a correção necessária (3 a 500 caracteres).'; END IF;
  UPDATE public.duels SET status='DISPUTED',dispute_reason=trim(_reason),revision=revision+1,confirmed_revision=NULL WHERE id=_duel;
 ELSIF _action='CONFIRM' THEN
  IF auth.uid()<>d.opponent_id OR d.status<>'PENDING_APPROVAL' THEN RAISE EXCEPTION 'Somente o desafiado pode confirmar os números enviados.'; END IF;
  UPDATE public.duels SET status='FINISHED',confirmed_revision=revision,finished_at=now() WHERE id=_duel;
 ELSE RAISE EXCEPTION 'Ação inválida.';
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.operate_duel(uuid,text,integer,jsonb,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.operate_duel(uuid,text,integer,jsonb,text) TO authenticated;
COMMENT ON TABLE public.duels IS 'Private friendly 1v1 records, never inserted into competitive matches; results become final only after opponent confirms the current revision.';