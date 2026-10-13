ALTER TABLE public.match_players ADD COLUMN IF NOT EXISTS arrival_order integer, ADD COLUMN IF NOT EXISTS queue_status text NOT NULL DEFAULT 'QUEUED', ADD COLUMN IF NOT EXISTS queue_index integer;
WITH ordered AS (SELECT match_id, player_id, row_number() OVER (PARTITION BY match_id ORDER BY queue_position, player_id)::integer AS n FROM public.match_players) UPDATE public.match_players p SET arrival_order=o.n, queue_status=CASE WHEN p.presence<>'confirmed' THEN 'LEFT' WHEN p.team IN ('colete','sem_colete') THEN 'ACTIVE' ELSE 'QUEUED' END FROM ordered o WHERE p.match_id=o.match_id AND p.player_id=o.player_id;
CREATE UNIQUE INDEX IF NOT EXISTS match_players_arrival_unique ON public.match_players(match_id,arrival_order);
CREATE INDEX IF NOT EXISTS match_players_fifo ON public.match_players(match_id,queue_status,arrival_order);
CREATE OR REPLACE FUNCTION public.fifo_size(_modality text) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT CASE _modality WHEN 'x1' THEN 1 WHEN 'x2' THEN 2 WHEN 'x5' THEN 5 WHEN 'x6' THEN 6 WHEN 'x7' THEN 7 WHEN 'x11' THEN 11 ELSE 5 END $$;
CREATE OR REPLACE FUNCTION public.reflow_match_queue(_match uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer; t text; next_id uuid; cnt integer;
BEGIN
 SELECT public.fifo_size(modality) INTO n FROM public.matches WHERE id=_match FOR UPDATE;
 IF n IS NULL THEN RAISE EXCEPTION 'Partida não encontrada'; END IF;
 UPDATE public.match_players SET queue_status='LEFT',team='unassigned',queue_index=NULL WHERE match_id=_match AND presence<>'confirmed';
 UPDATE public.match_players SET queue_status=CASE WHEN team IN ('colete','sem_colete') THEN 'ACTIVE' ELSE 'QUEUED' END WHERE match_id=_match AND presence='confirmed';
 FOREACH t IN ARRAY ARRAY['colete','sem_colete'] LOOP
  UPDATE public.match_players SET team='unassigned',queue_status='QUEUED' WHERE match_id=_match AND player_id IN (SELECT player_id FROM public.match_players WHERE match_id=_match AND presence='confirmed' AND team=t ORDER BY arrival_order OFFSET n);
  SELECT count(*) INTO cnt FROM public.match_players WHERE match_id=_match AND presence='confirmed' AND team=t;
  WHILE cnt<n LOOP
   SELECT player_id INTO next_id FROM public.match_players WHERE match_id=_match AND presence='confirmed' AND queue_status='QUEUED' ORDER BY arrival_order LIMIT 1;
   EXIT WHEN next_id IS NULL;
   UPDATE public.match_players SET team=t,queue_status='ACTIVE',queue_index=NULL WHERE match_id=_match AND player_id=next_id;
   cnt:=cnt+1;
  END LOOP;
 END LOOP;
 UPDATE public.match_players SET queue_index=NULL WHERE match_id=_match AND queue_status='ACTIVE';
 WITH q AS (SELECT player_id,row_number() OVER (ORDER BY arrival_order)::integer AS idx,count(*) OVER ()::integer AS total FROM public.match_players WHERE match_id=_match AND queue_status='QUEUED' AND presence='confirmed')
 UPDATE public.match_players p SET queue_index=q.idx,team=CASE WHEN q.idx<=LEAST(3,(q.total/n))*n THEN 'proxima_'||(((q.idx-1)/n)+1)::text ELSE 'unassigned' END FROM q WHERE p.match_id=_match AND p.player_id=q.player_id;
END $$;
REVOKE ALL ON FUNCTION public.reflow_match_queue(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reflow_match_queue(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.guard_match_arrival() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE state text;
BEGIN
 SELECT status INTO state FROM public.matches WHERE id=NEW.match_id FOR UPDATE;
 IF TG_OP='INSERT' THEN
  IF state NOT IN ('open','in_progress') THEN RAISE EXCEPTION 'Esta partida não aceita novos atletas'; END IF;
  SELECT COALESCE(MAX(arrival_order),0)+1 INTO NEW.arrival_order FROM public.match_players WHERE match_id=NEW.match_id;
  NEW.queue_position:=NEW.arrival_order;
  NEW.queue_status:=CASE WHEN NEW.presence='confirmed' THEN 'QUEUED' ELSE 'LEFT' END;
  NEW.team:='unassigned'; NEW.queue_index:=NULL;
 ELSE
  IF NEW.arrival_order IS DISTINCT FROM OLD.arrival_order OR NEW.match_id IS DISTINCT FROM OLD.match_id OR NEW.player_id IS DISTINCT FROM OLD.player_id THEN RAISE EXCEPTION 'A ordem de chegada não pode ser alterada'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER match_arrival_guard BEFORE INSERT OR UPDATE ON public.match_players FOR EACH ROW EXECUTE FUNCTION public.guard_match_arrival();
CREATE OR REPLACE FUNCTION public.on_match_queue_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE mid uuid; state text;
BEGIN
 IF pg_trigger_depth()>1 THEN RETURN NULL; END IF;
 mid:=CASE WHEN TG_OP='DELETE' THEN OLD.match_id ELSE NEW.match_id END;
 SELECT status INTO state FROM public.matches WHERE id=mid;
 IF state IN ('open','in_progress') THEN PERFORM public.reflow_match_queue(mid); END IF;
 RETURN NULL;
END $$;
CREATE TRIGGER match_queue_insert_delete AFTER INSERT OR DELETE ON public.match_players FOR EACH ROW EXECUTE FUNCTION public.on_match_queue_change();
CREATE TRIGGER match_queue_presence AFTER UPDATE OF presence ON public.match_players FOR EACH ROW WHEN (OLD.presence IS DISTINCT FROM NEW.presence) EXECUTE FUNCTION public.on_match_queue_change();
CREATE OR REPLACE FUNCTION public.on_match_modality_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NEW.status='open' THEN PERFORM public.reflow_match_queue(NEW.id); END IF; RETURN NULL; END $$;
CREATE TRIGGER match_modality_queue AFTER UPDATE OF modality ON public.matches FOR EACH ROW WHEN (OLD.modality IS DISTINCT FROM NEW.modality) EXECUTE FUNCTION public.on_match_modality_change();
CREATE OR REPLACE FUNCTION public.remove_match_player(_match uuid,_player uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner_id uuid; state text;
BEGIN
 SELECT creator_id,status INTO owner_id,state FROM public.matches WHERE id=_match FOR UPDATE;
 IF auth.uid() IS NULL OR (auth.uid()<>_player AND auth.uid() IS DISTINCT FROM owner_id) THEN RAISE EXCEPTION 'Você não pode remover este atleta'; END IF;
 IF state NOT IN ('open','in_progress') THEN RAISE EXCEPTION 'A partida já terminou'; END IF;
 UPDATE public.match_players SET presence='declined',team='unassigned',queue_status='LEFT',queue_index=NULL WHERE match_id=_match AND player_id=_player;
 IF NOT FOUND THEN RAISE EXCEPTION 'Atleta não encontrado'; END IF;
 PERFORM public.reflow_match_queue(_match);
END $$;
REVOKE ALL ON FUNCTION public.remove_match_player(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.remove_match_player(uuid,uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.set_presence(_match uuid,_presence text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE state text; nxt integer;
BEGIN
 IF auth.uid() IS NULL OR _presence NOT IN ('confirmed','declined') THEN RAISE EXCEPTION 'Presença inválida'; END IF;
 SELECT status INTO state FROM public.matches WHERE id=_match FOR UPDATE;
 IF state NOT IN ('open','in_progress') OR state IS NULL THEN RAISE EXCEPTION 'Esta partida não aceita alterações de presença'; END IF;
 IF EXISTS (SELECT 1 FROM public.match_players WHERE match_id=_match AND player_id=auth.uid()) THEN
  UPDATE public.match_players SET presence=_presence,team=CASE WHEN _presence='declined' THEN 'unassigned' ELSE team END WHERE match_id=_match AND player_id=auth.uid();
 ELSE
  SELECT COALESCE(MAX(arrival_order),0)+1 INTO nxt FROM public.match_players WHERE match_id=_match;
  INSERT INTO public.match_players(match_id,player_id,queue_position,presence) VALUES (_match,auth.uid(),nxt,_presence);
 END IF;
 PERFORM public.reflow_match_queue(_match);
END $$;
REVOKE ALL ON FUNCTION public.set_presence(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_presence(uuid,text) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.save_match_draw(_match uuid,_teams jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer; state text; owner_id uuid; a integer; b integer;
BEGIN
 SELECT creator_id,status,public.fifo_size(modality) INTO owner_id,state,n FROM public.matches WHERE id=_match FOR UPDATE;
 IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM owner_id THEN RAISE EXCEPTION 'Apenas o organizador pode sortear'; END IF;
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
COMMENT ON COLUMN public.match_players.queue_position IS 'DEPRECATED: arrival_order is the immutable FIFO arrival sequence; queue_index is the contiguous waiting position';