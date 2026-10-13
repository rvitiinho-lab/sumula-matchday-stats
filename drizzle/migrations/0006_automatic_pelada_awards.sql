ALTER TABLE public.matches ADD COLUMN pelada_id uuid REFERENCES public.matches(id), ADD COLUMN round_number integer NOT NULL DEFAULT 1, ADD COLUMN pelada_closed boolean NOT NULL DEFAULT false;
ALTER TABLE public.match_players ADD COLUMN difficult_saves integer NOT NULL DEFAULT 0 CHECK (difficult_saves >= 0), ADD COLUMN final_team text, ADD COLUMN victory_points integer NOT NULL DEFAULT 0 CHECK (victory_points IN (0,2));
ALTER TABLE public.match_events ADD COLUMN difficult_save boolean NOT NULL DEFAULT false CHECK (NOT difficult_save OR type='save');
UPDATE public.matches SET pelada_closed=true WHERE status='finished';
UPDATE public.match_players p SET final_team=p.team, victory_points=CASE WHEN p.presence='confirmed' AND ((p.team='colete' AND COALESCE(m.score_team_a,0)>COALESCE(m.score_team_b,0)) OR (p.team='sem_colete' AND COALESCE(m.score_team_b,0)>COALESCE(m.score_team_a,0))) THEN 2 ELSE 0 END FROM public.matches m WHERE m.id=p.match_id AND m.status='finished';
CREATE UNIQUE INDEX matches_round_unique ON public.matches(COALESCE(pelada_id,id),round_number);
CREATE INDEX matches_pelada ON public.matches(pelada_id);
CREATE OR REPLACE FUNCTION public.performance_points(g integer,a integer,t integer,s integer,d integer,c integer,fs integer,fc integer,v integer) RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT COALESCE(g,0)*5+COALESCE(a,0)*3+COALESCE(t,0)*2+COALESCE(s,0)+COALESCE(d,0)*2+COALESCE(c,0)*0.5+COALESCE(fs,0)*0.5-COALESCE(fc,0)*0.5+COALESCE(v,0) $$;
CREATE OR REPLACE FUNCTION public.pelada_performances(_match uuid) RETURNS TABLE(match_id uuid,player_id uuid,points numeric,actions integer,mvps integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH root AS (SELECT COALESCE(pelada_id,id) id FROM public.matches WHERE id=_match), scores AS (
 SELECT p.match_id,p.player_id,public.performance_points(p.goals,p.assists,p.tackles,p.saves,p.difficult_saves,p.shots_on_goal,p.fouls_suffered,p.fouls_committed,p.victory_points) points,COALESCE(p.goals,0)+COALESCE(p.assists,0)+p.tackles+p.saves+p.difficult_saves+p.shots_on_goal+p.fouls_suffered+p.fouls_committed actions
 FROM public.match_players p JOIN public.matches m ON m.id=p.match_id JOIN root r ON COALESCE(m.pelada_id,m.id)=r.id WHERE m.status='finished'), ranked AS (
 SELECT *,MAX(points) OVER(PARTITION BY match_id) top,COUNT(*) FILTER(WHERE actions>0) OVER(PARTITION BY match_id) enough FROM scores), tied AS (SELECT *,COUNT(*) FILTER(WHERE points=top) OVER(PARTITION BY match_id) ties FROM ranked)
 SELECT match_id,player_id,points,actions,CASE WHEN enough>=2 AND points=top AND top>0 AND ties=1 THEN 1 ELSE 0 END FROM tied
 $$;
CREATE OR REPLACE FUNCTION public.pelada_winner(_match uuid) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH scores AS (SELECT player_id,SUM(points) points,SUM(mvps) mvps,SUM(actions) actions FROM public.pelada_performances(_match) GROUP BY player_id), ranked AS (SELECT *,DENSE_RANK() OVER(ORDER BY points DESC,mvps DESC) rank FROM scores)
 SELECT CASE WHEN (SELECT COUNT(*) FROM scores WHERE actions>0)>=2 AND COUNT(*)=1 AND MAX(points)>0 THEN (array_agg(player_id))[1] ELSE NULL END FROM ranked WHERE rank=1
 $$;
CREATE TABLE public.pelada_messages(pelada_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,player_id uuid NOT NULL REFERENCES public.profiles(id),message text NOT NULL CHECK(char_length(message)<=120),PRIMARY KEY(pelada_id,player_id));
GRANT SELECT ON public.pelada_messages TO anon;
GRANT SELECT,INSERT,UPDATE ON public.pelada_messages TO authenticated;
GRANT ALL ON public.pelada_messages TO service_role;
ALTER TABLE public.pelada_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages public" ON public.pelada_messages FOR SELECT USING(true);
CREATE OR REPLACE FUNCTION public.can_write_award_message(_pelada uuid,_player uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT auth.uid()=_player AND EXISTS(SELECT 1 FROM public.matches WHERE id=_pelada AND pelada_id IS NULL AND pelada_closed) AND (public.pelada_winner(_pelada)=_player OR EXISTS(SELECT 1 FROM public.pelada_performances(_pelada) WHERE player_id=_player AND mvps=1)) $$;
CREATE POLICY "winner writes message" ON public.pelada_messages FOR INSERT TO authenticated WITH CHECK(public.can_write_award_message(pelada_id,player_id));
CREATE POLICY "winner edits message" ON public.pelada_messages FOR UPDATE TO authenticated USING(public.can_write_award_message(pelada_id,player_id)) WITH CHECK(public.can_write_award_message(pelada_id,player_id));
CREATE OR REPLACE FUNCTION public.guard_finished_players() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE state text; BEGIN SELECT status INTO state FROM public.matches WHERE id=CASE WHEN TG_OP='DELETE' THEN OLD.match_id ELSE NEW.match_id END FOR UPDATE; IF state='finished' THEN RAISE EXCEPTION 'A súmula encerrada não pode ser alterada'; END IF; IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF; END $$;
CREATE TRIGGER protect_finished_players BEFORE INSERT OR UPDATE OR DELETE ON public.match_players FOR EACH ROW EXECUTE FUNCTION public.guard_finished_players();
CREATE OR REPLACE FUNCTION public.guard_match_finish() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF TG_OP='UPDATE' AND OLD.status='finished' AND (to_jsonb(NEW)-'pelada_closed') IS DISTINCT FROM (to_jsonb(OLD)-'pelada_closed') THEN RAISE EXCEPTION 'A rodada encerrada não pode ser alterada'; END IF;
 IF TG_OP='UPDATE' AND OLD.pelada_closed AND NOT NEW.pelada_closed THEN RAISE EXCEPTION 'A pelada já foi encerrada'; END IF;
 IF TG_OP='UPDATE' AND NEW.pelada_id IS DISTINCT FROM OLD.pelada_id THEN RAISE EXCEPTION 'A rodada não pode mudar de pelada'; END IF;
 IF NEW.pelada_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.matches WHERE id=NEW.pelada_id AND (pelada_closed OR creator_id IS DISTINCT FROM NEW.creator_id OR pelada_id IS NOT NULL)) THEN RAISE EXCEPTION 'Pelada inválida ou encerrada'; END IF;
 IF TG_OP='UPDATE' AND NEW.status='finished' AND OLD.status IS DISTINCT FROM 'finished' THEN
 UPDATE public.match_players SET final_team=team,victory_points=CASE WHEN presence='confirmed' AND ((team='colete' AND COALESCE(NEW.score_team_a,0)>COALESCE(NEW.score_team_b,0)) OR (team='sem_colete' AND COALESCE(NEW.score_team_b,0)>COALESCE(NEW.score_team_a,0))) THEN 2 ELSE 0 END WHERE match_id=NEW.id;
 NEW.finished_at:=COALESCE(NEW.finished_at,now()); END IF;
 RETURN NEW; END $$;
CREATE TRIGGER protect_match_finish BEFORE INSERT OR UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.guard_match_finish();
CREATE OR REPLACE FUNCTION public.apply_match_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE ev public.match_events; delta integer; col text; state text; BEGIN
 IF TG_OP='INSERT' THEN ev:=NEW;delta:=1;ELSE ev:=OLD;delta:=-1;END IF;
 SELECT status INTO state FROM public.matches WHERE id=ev.match_id FOR UPDATE;
 IF NOT public.is_match_creator(ev.match_id) OR state<>'in_progress' THEN RAISE EXCEPTION 'Somente o organizador registra lances ao vivo';END IF;
 IF TG_OP='INSERT' AND NOT EXISTS(SELECT 1 FROM public.match_players WHERE match_id=ev.match_id AND player_id=ev.player_id AND team=ev.team AND presence='confirmed' AND team IN ('colete','sem_colete')) THEN RAISE EXCEPTION 'Atleta fora do campo';END IF;
 col:=CASE ev.type WHEN 'goal' THEN 'goals' WHEN 'assist' THEN 'assists' WHEN 'tackle' THEN 'tackles' WHEN 'shot_on_goal' THEN 'shots_on_goal' WHEN 'foul_suffered' THEN 'fouls_suffered' WHEN 'foul_committed' THEN 'fouls_committed' WHEN 'save' THEN CASE WHEN ev.difficult_save THEN 'difficult_saves' ELSE 'saves' END END;
 IF col IS NULL OR ev.minute<0 THEN RAISE EXCEPTION 'Lance inválido';END IF;
 EXECUTE format('UPDATE public.match_players SET %I=GREATEST(0,COALESCE(%I,0)+$1) WHERE match_id=$2 AND player_id=$3',col,col) USING delta,ev.match_id,ev.player_id;
 IF ev.type='goal' THEN IF ev.team='colete' THEN UPDATE public.matches SET score_team_a=GREATEST(0,COALESCE(score_team_a,0)+delta) WHERE id=ev.match_id;ELSE UPDATE public.matches SET score_team_b=GREATEST(0,COALESCE(score_team_b,0)+delta) WHERE id=ev.match_id;END IF;END IF;
 IF TG_OP='INSERT' THEN RETURN NEW;ELSE RETURN OLD;END IF;END $$;
CREATE OR REPLACE FUNCTION public.next_pelada_round(_match uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE root_id uuid; r public.matches; last_round public.matches; nxt uuid; p public.match_players; BEGIN
 SELECT COALESCE(pelada_id,id) INTO root_id FROM public.matches WHERE id=_match;
 SELECT * INTO r FROM public.matches WHERE id=root_id FOR UPDATE;
 IF auth.uid() IS NULL OR r.creator_id IS DISTINCT FROM auth.uid() OR r.pelada_closed THEN RAISE EXCEPTION 'Apenas o organizador de uma pelada aberta';END IF;
 SELECT * INTO last_round FROM public.matches WHERE COALESCE(pelada_id,id)=root_id ORDER BY round_number DESC LIMIT 1 FOR UPDATE;
 IF last_round.status<>'finished' THEN RETURN last_round.id;END IF;
 INSERT INTO public.matches(creator_id,title,modality,status,scheduled_at,location,pelada_id,round_number) VALUES(r.creator_id,r.title,last_round.modality,'open',r.scheduled_at,r.location,root_id,last_round.round_number+1) RETURNING id INTO nxt;
 FOR p IN SELECT * FROM public.match_players WHERE match_id=last_round.id ORDER BY arrival_order LOOP
 UPDATE public.matches SET arrival_counter=COALESCE(p.arrival_order,p.queue_position)-1 WHERE id=nxt;
 INSERT INTO public.match_players(match_id,player_id,queue_position,presence) VALUES(nxt,p.player_id,p.queue_position,p.presence);
 END LOOP;
 UPDATE public.match_players dest SET team=src.team FROM public.match_players src WHERE src.match_id=last_round.id AND dest.match_id=nxt AND dest.player_id=src.player_id;
 PERFORM public.reflow_match_queue(nxt);RETURN nxt;END $$;
CREATE OR REPLACE FUNCTION public.finish_pelada(_match uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE root_id uuid;r public.matches;mid uuid;BEGIN
 SELECT COALESCE(pelada_id,id) INTO root_id FROM public.matches WHERE id=_match;
 SELECT * INTO r FROM public.matches WHERE id=root_id FOR UPDATE;
 IF auth.uid() IS NULL OR r.creator_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Somente o organizador encerra a pelada';END IF;
 IF r.pelada_closed THEN RETURN root_id;END IF;
 FOR mid IN SELECT id FROM public.matches WHERE COALESCE(pelada_id,id)=root_id AND status<>'finished' ORDER BY round_number LOOP UPDATE public.matches SET status='finished',finished_at=now() WHERE id=mid;END LOOP;
 UPDATE public.matches SET pelada_closed=true WHERE id=root_id;RETURN root_id;END $$;
REVOKE ALL ON FUNCTION public.next_pelada_round(uuid),public.finish_pelada(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.next_pelada_round(uuid),public.finish_pelada(uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.match_voting_open(_match uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=public AS $$ SELECT false $$;
REVOKE EXECUTE ON FUNCTION public.close_voting(uuid) FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.match_votes IS 'DEPRECATED: automatic MVP replaces category votes; retained for history';
COMMENT ON TABLE public.match_ratings IS 'DEPRECATED: automatic performance points replace post-match ratings; retained for history';
COMMENT ON COLUMN public.matches.voting_closed IS 'DEPRECATED: pelada_closed releases automatic awards; historical value retained';