CREATE OR REPLACE FUNCTION public.can_access_match_chat(_match uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND (public.can_operate_match(_match) OR EXISTS(SELECT 1 FROM public.match_players WHERE match_id=_match AND player_id=auth.uid() AND presence='confirmed'))
$$;
REVOKE ALL ON FUNCTION public.can_access_match_chat(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_access_match_chat(uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.match_chat_text_allowed(_text text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT length(btrim(_text)) BETWEEN 1 AND 500 AND NOT (regexp_replace(translate(lower(_text), 'áàâãäéèêëíìîïóòôõöúùûüç01234578', 'aaaaaeeeeiiiiooooouuuucolzeastb'), '[^a-z]+', ' ', 'g') ~ '(^| )(estupr[a-z]*|pedofil[a-z]*|nazist[a-z]*|neonazist[a-z]*|heil hitler|sieg heil|vou (te |)(matar|esfaquear|estuprar)|matar (voce|voces|negros|gays)|negro (imundo|inferior)|preto (imundo|inferior)|macaco|traveco)( |$)')
$$;
CREATE TABLE public.match_chat_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
 player_id uuid NOT NULL REFERENCES public.profiles(id),
 message text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT ON public.match_chat_messages TO authenticated;
GRANT ALL ON public.match_chat_messages TO service_role;
ALTER TABLE public.match_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read chat" ON public.match_chat_messages FOR SELECT TO authenticated USING (public.can_access_match_chat(match_id));
CREATE POLICY "participants send moderated chat" ON public.match_chat_messages FOR INSERT TO authenticated WITH CHECK (player_id=auth.uid() AND public.can_access_match_chat(match_id));
CREATE INDEX match_chat_history ON public.match_chat_messages(match_id,created_at,id);
CREATE OR REPLACE FUNCTION public.guard_match_chat_message() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 NEW.message:=btrim(regexp_replace(NEW.message,'[[:cntrl:]]','','g'));
 IF NOT public.match_chat_text_allowed(NEW.message) THEN RAISE EXCEPTION 'Mensagem bloqueada por conter termos inadequados'; END IF;
 NEW.created_at:=now();
 RETURN NEW;
END $$;
CREATE TRIGGER match_chat_moderation BEFORE INSERT ON public.match_chat_messages FOR EACH ROW EXECUTE FUNCTION public.guard_match_chat_message();
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_chat_messages;
CREATE OR REPLACE FUNCTION public.create_pelada(_title text,_modality text,_scheduled timestamptz DEFAULT NULL,_location text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE mid uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta'; END IF;
 IF _modality IS NULL OR _modality NOT IN ('x1','x2','x5','x6','x7','x11') OR length(btrim(COALESCE(_title,''))) NOT BETWEEN 1 AND 60 OR length(COALESCE(_location,''))>120 THEN RAISE EXCEPTION 'Dados da pelada inválidos'; END IF;
 INSERT INTO public.matches(creator_id,title,modality,scheduled_at,location) VALUES(auth.uid(),btrim(_title),_modality,_scheduled,NULLIF(btrim(_location),'')) RETURNING id INTO mid;
 PERFORM public.set_presence(mid,'confirmed');
 RETURN mid;
END $$;
REVOKE ALL ON FUNCTION public.create_pelada(text,text,timestamptz,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_pelada(text,text,timestamptz,text) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.save_match_draw(_match uuid,_teams jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer; state text; owner_id uuid; a integer; b integer;
BEGIN
 SELECT creator_id,status,public.fifo_size(modality) INTO owner_id,state,n FROM public.matches WHERE id=_match FOR UPDATE;
 IF NOT public.can_operate_match(_match) THEN RAISE EXCEPTION 'Apenas organizador ou mesário pode sortear'; END IF;
 IF state<>'open' THEN RAISE EXCEPTION 'Sorteio disponível antes da partida'; END IF;
 IF jsonb_typeof(_teams)<>'object' THEN RAISE EXCEPTION 'Sorteio inválido'; END IF;
 IF EXISTS (SELECT 1 FROM public.match_players p WHERE match_id=_match AND presence='confirmed' AND (COALESCE(_teams->>player_id::text,'') NOT IN ('colete','sem_colete','proxima_1','proxima_2','proxima_3','unassigned'))) THEN RAISE EXCEPTION 'Sorteio incompleto'; END IF;
 IF EXISTS (SELECT 1 FROM (SELECT player_id,row_number() OVER (ORDER BY arrival_order) AS pos FROM public.match_players WHERE match_id=_match AND presence='confirmed') q WHERE (pos<=2*n) IS DISTINCT FROM ((_teams->>player_id::text) IN ('colete','sem_colete'))) THEN RAISE EXCEPTION 'Titulares devem respeitar a chegada'; END IF;
 SELECT count(*) FILTER (WHERE _teams->>player_id::text='colete'),count(*) FILTER (WHERE _teams->>player_id::text='sem_colete') INTO a,b FROM public.match_players WHERE match_id=_match AND presence='confirmed';
 IF a>n OR b>n THEN RAISE EXCEPTION 'Time acima da capacidade'; END IF;
 UPDATE public.match_players SET team=_teams->>player_id::text WHERE match_id=_match AND presence='confirmed';
 PERFORM public.reflow_match_queue(_match);
END $$;
REVOKE ALL ON FUNCTION public.save_match_draw(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_match_draw(uuid,jsonb) TO authenticated,service_role;