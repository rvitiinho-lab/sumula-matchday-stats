ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS correction_audit jsonb NOT NULL DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.matches.correction_audit IS 'Audited organizer corrections; competitive eligibility still requires event reconciliation.';
CREATE OR REPLACE FUNCTION public.guard_competitive_match() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  IF OLD.status='finished' OR OLD.pelada_closed OR EXISTS(SELECT 1 FROM public.matches WHERE pelada_id=OLD.id AND status='finished') THEN RAISE EXCEPTION 'Resultados encerrados não podem ser apagados'; END IF;
  RETURN OLD;
 END IF;
 IF current_user NOT IN ('postgres','supabase_admin','service_role') AND pg_trigger_depth()=1 THEN
  IF TG_OP='INSERT' THEN
   IF COALESCE(NEW.status,'open')<>'open' OR COALESCE(NEW.score_team_a,0)<>0 OR COALESCE(NEW.score_team_b,0)<>0 OR NEW.clock_seconds<>0 OR NEW.clock_running_at IS NOT NULL OR NEW.started_at IS NOT NULL OR NEW.finished_at IS NOT NULL OR NEW.pelada_closed OR NEW.correction_audit<>'[]'::jsonb THEN RAISE EXCEPTION 'Crie uma rodada aberta sem resultados'; END IF;
  ELSE
   IF NEW.creator_id IS DISTINCT FROM OLD.creator_id OR NEW.score_team_a IS DISTINCT FROM OLD.score_team_a OR NEW.score_team_b IS DISTINCT FROM OLD.score_team_b OR NEW.clock_seconds IS DISTINCT FROM OLD.clock_seconds OR NEW.clock_running_at IS DISTINCT FROM OLD.clock_running_at OR NEW.started_at IS DISTINCT FROM OLD.started_at OR NEW.pelada_closed IS DISTINCT FROM OLD.pelada_closed OR NEW.correction_audit IS DISTINCT FROM OLD.correction_audit THEN RAISE EXCEPTION 'Use a operação autorizada da partida'; END IF;
   IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status<>'finished' THEN RAISE EXCEPTION 'Use o cronômetro para iniciar a partida'; END IF;
    NEW.finished_at:=now();
   ELSIF NEW.finished_at IS DISTINCT FROM OLD.finished_at THEN RAISE EXCEPTION 'Horário de encerramento protegido'; END IF;
  END IF;
 END IF;
 IF COALESCE(NEW.score_team_a,0)<0 OR COALESCE(NEW.score_team_b,0)<0 THEN RAISE EXCEPTION 'Placar inválido'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER a_competitive_match_guard BEFORE INSERT OR UPDATE OR DELETE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.guard_competitive_match();
CREATE OR REPLACE FUNCTION public.guard_competitive_player() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF current_user NOT IN ('postgres','supabase_admin','service_role') AND pg_trigger_depth()=1 THEN
  IF TG_OP='INSERT' THEN
   IF COALESCE(NEW.goals,0)<>0 OR COALESCE(NEW.assists,0)<>0 OR NEW.tackles<>0 OR NEW.saves<>0 OR NEW.difficult_saves<>0 OR NEW.shots_on_goal<>0 OR NEW.fouls_suffered<>0 OR NEW.fouls_committed<>0 OR NEW.victory_points<>0 OR NEW.final_team IS NOT NULL THEN RAISE EXCEPTION 'Estatísticas iniciais devem estar zeradas'; END IF;
  ELSE
   IF ROW(NEW.goals,NEW.assists,NEW.tackles,NEW.saves,NEW.difficult_saves,NEW.shots_on_goal,NEW.fouls_suffered,NEW.fouls_committed,NEW.victory_points,NEW.final_team) IS DISTINCT FROM ROW(OLD.goals,OLD.assists,OLD.tackles,OLD.saves,OLD.difficult_saves,OLD.shots_on_goal,OLD.fouls_suffered,OLD.fouls_committed,OLD.victory_points,OLD.final_team) THEN RAISE EXCEPTION 'Use lances ou correção autorizada'; END IF;
  END IF;
 END IF;
 IF LEAST(COALESCE(NEW.goals,0),COALESCE(NEW.assists,0),NEW.tackles,NEW.saves,NEW.difficult_saves,NEW.shots_on_goal,NEW.fouls_suffered,NEW.fouls_committed)<0 THEN RAISE EXCEPTION 'Estatística negativa'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER a_competitive_player_guard BEFORE INSERT OR UPDATE ON public.match_players FOR EACH ROW EXECUTE FUNCTION public.guard_competitive_player();
CREATE OR REPLACE FUNCTION public.correct_match_record(_match uuid,_field text,_value integer,_player uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.matches; previous integer;
BEGIN
 SELECT * INTO m FROM public.matches WHERE id=_match FOR UPDATE;
 IF auth.uid() IS NULL OR m.creator_id IS DISTINCT FROM auth.uid() OR m.status NOT IN ('open','in_progress') OR _value IS NULL OR _value<0 OR _value>10000 THEN RAISE EXCEPTION 'Correção não permitida'; END IF;
 IF _field IN ('score_team_a','score_team_b') AND _player IS NULL THEN
  previous:=CASE WHEN _field='score_team_a' THEN m.score_team_a ELSE m.score_team_b END;
  EXECUTE format('UPDATE public.matches SET %I=$1 WHERE id=$2',_field) USING _value,_match;
 ELSIF _field IN ('goals','assists') AND _player IS NOT NULL THEN
  SELECT CASE WHEN _field='goals' THEN goals ELSE assists END INTO previous FROM public.match_players WHERE match_id=_match AND player_id=_player FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Atleta não encontrado'; END IF;
  EXECUTE format('UPDATE public.match_players SET %I=$1 WHERE match_id=$2 AND player_id=$3',_field) USING _value,_match,_player;
 ELSE RAISE EXCEPTION 'Campo inválido'; END IF;
 UPDATE public.matches SET correction_audit=correction_audit||jsonb_build_array(jsonb_build_object('by',auth.uid(),'at',now(),'field',_field,'player',_player,'before',previous,'after',_value)) WHERE id=_match;
END $$;
REVOKE ALL ON FUNCTION public.correct_match_record(uuid,text,integer,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.correct_match_record(uuid,text,integer,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.guard_competitive_event() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE m public.matches; seconds integer;
BEGIN
 SELECT * INTO m FROM public.matches WHERE id=NEW.match_id FOR UPDATE;
 seconds:=m.clock_seconds+CASE WHEN m.clock_running_at IS NULL THEN 0 ELSE GREATEST(0,EXTRACT(epoch FROM now()-m.clock_running_at)::integer) END;
 IF m.status<>'in_progress' OR NEW.minute<0 OR NEW.minute>seconds/60 OR NEW.team NOT IN ('colete','sem_colete') THEN RAISE EXCEPTION 'Lance fora da partida ou do cronômetro'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER competitive_event_guard BEFORE INSERT ON public.match_events FOR EACH ROW EXECUTE FUNCTION public.guard_competitive_event();
CREATE OR REPLACE FUNCTION public.record_match_event(_id uuid,_match uuid,_player uuid,_team text,_type text,_minute integer,_difficult boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE old_event public.match_events;
BEGIN
 IF NOT public.can_operate_match(_match) THEN RAISE EXCEPTION 'Operação não permitida'; END IF;
 PERFORM 1 FROM public.matches WHERE id=_match FOR UPDATE;
 SELECT * INTO old_event FROM public.match_events WHERE id=_id;
 IF FOUND THEN
  IF old_event.match_id IS DISTINCT FROM _match OR old_event.player_id IS DISTINCT FROM _player OR old_event.team IS DISTINCT FROM _team OR old_event.type IS DISTINCT FROM _type OR old_event.minute IS DISTINCT FROM _minute OR old_event.difficult_save IS DISTINCT FROM _difficult THEN RAISE EXCEPTION 'Identificador já usado em outro lance'; END IF;
  RETURN _id;
 END IF;
 INSERT INTO public.match_events(id,match_id,player_id,team,type,minute,difficult_save) VALUES(_id,_match,_player,_team,_type,_minute,_difficult);
 RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.record_match_event(uuid,uuid,uuid,text,text,integer,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_match_event(uuid,uuid,uuid,text,text,integer,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.competitive_ranking() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre para consultar o ranking'; END IF;
 WITH event_totals AS (
  SELECT match_id,player_id,count(*) FILTER(WHERE type='goal') g,count(*) FILTER(WHERE type='assist') a,count(*) FILTER(WHERE type='tackle') t,count(*) FILTER(WHERE type='save' AND NOT difficult_save) s,count(*) FILTER(WHERE type='save' AND difficult_save) d,count(*) FILTER(WHERE type='shot_on_goal') c,count(*) FILTER(WHERE type='foul_suffered') fs,count(*) FILTER(WHERE type='foul_committed') fc FROM public.match_events GROUP BY match_id,player_id
 ), checks AS (
  SELECT m.*,COALESCE(m.pelada_id,m.id) root,
   CASE
    WHEN m.status IS DISTINCT FROM 'finished' OR NOT COALESCE(r.pelada_closed,false) THEN 'Pelada ainda não encerrada'
    WHEN m.started_at IS NULL OR m.finished_at IS NULL OR m.finished_at<m.started_at THEN 'Sem início e fim válidos'
    WHEN m.clock_seconds<480 THEN 'Menos de 8 minutos efetivos'
    WHEN NOT EXISTS(SELECT 1 FROM public.match_players p WHERE p.match_id=m.id AND p.presence='confirmed' AND p.final_team='colete') OR NOT EXISTS(SELECT 1 FROM public.match_players p WHERE p.match_id=m.id AND p.presence='confirmed' AND p.final_team='sem_colete') THEN 'Dois times reais não registrados'
    WHEN (SELECT count(DISTINCT player_id) FROM public.match_events WHERE match_id=m.id)<2 THEN 'Lances de menos de dois atletas'
    WHEN m.score_team_a IS NULL OR m.score_team_b IS NULL OR m.score_team_a<0 OR m.score_team_b<0 OR m.score_team_a<>(SELECT count(*) FROM public.match_events WHERE match_id=m.id AND type='goal' AND team='colete') OR m.score_team_b<>(SELECT count(*) FROM public.match_events WHERE match_id=m.id AND type='goal' AND team='sem_colete') THEN 'Placar não corresponde aos lances'
    WHEN EXISTS(SELECT 1 FROM public.match_players p LEFT JOIN event_totals e ON e.match_id=p.match_id AND e.player_id=p.player_id WHERE p.match_id=m.id AND (COALESCE(p.goals,0)<>COALESCE(e.g,0) OR COALESCE(p.assists,0)<>COALESCE(e.a,0) OR p.tackles<>COALESCE(e.t,0) OR p.saves<>COALESCE(e.s,0) OR p.difficult_saves<>COALESCE(e.d,0) OR p.shots_on_goal<>COALESCE(e.c,0) OR p.fouls_suffered<>COALESCE(e.fs,0) OR p.fouls_committed<>COALESCE(e.fc,0))) THEN 'Estatísticas não correspondem aos lances'
    ELSE NULL END reason
  FROM public.matches m LEFT JOIN public.matches r ON r.id=COALESCE(m.pelada_id,m.id)
 ), action_scores AS (
  SELECT p.player_id,c.root,c.id, p.final_team,c.score_team_a,c.score_team_b,
   GREATEST(0,5*COALESCE(p.goals,0)+3*COALESCE(p.assists,0)+2*p.tackles+p.saves+2*p.difficult_saves+0.5*p.shots_on_goal+0.5*p.fouls_suffered-0.5*p.fouls_committed)::numeric a
  FROM checks c JOIN public.match_players p ON p.match_id=c.id WHERE c.reason IS NULL AND p.presence='confirmed' AND p.final_team IN ('colete','sem_colete')
 ), round_scores AS (
  SELECT *,70*a/(a+10) individual,CASE WHEN (final_team='colete' AND score_team_a>score_team_b) OR (final_team='sem_colete' AND score_team_b>score_team_a) THEN 1::numeric ELSE 0::numeric END win,CASE WHEN score_team_a=score_team_b THEN 15 WHEN (final_team='colete' AND score_team_a>score_team_b) OR (final_team='sem_colete' AND score_team_b>score_team_a) THEN 30 ELSE 0 END result FROM action_scores
 ), nights AS (
  SELECT player_id,root,avg(individual+result) score,avg(individual) individual,avg(win) wins,count(*) rounds FROM round_scores GROUP BY player_id,root
 ), totals AS (
  SELECT player_id,count(*) peladas,sum(rounds) rounds,(sum(score)+150)/(count(*)+3) score,avg(individual) individual,avg(wins) wins FROM nights GROUP BY player_id
 ), awards AS (
  SELECT pp.player_id,sum(pp.mvps) mvps FROM public.matches m CROSS JOIN LATERAL public.pelada_performances(m.id) pp WHERE m.pelada_id IS NULL GROUP BY pp.player_id
 ), career AS (
  SELECT p.player_id,count(*) games,sum(COALESCE(p.goals,0)) goals,sum(COALESCE(p.assists,0)) assists,sum(p.tackles) tackles,sum(p.saves+p.difficult_saves) saves FROM public.match_players p JOIN public.matches m ON m.id=p.match_id WHERE m.status='finished' GROUP BY p.player_id
 ), ranked AS (
  SELECT t.*,rank() OVER(ORDER BY score DESC,individual DESC,wins DESC) position FROM totals t WHERE peladas>=5
 ), players AS (
  SELECT p.id,p.nome name,p.apelido nickname,p.position role,p.quote,p.overall_rating overall,COALESCE(a.mvps,0) mvps,COALESCE(t.peladas,0) peladas,COALESCE(t.rounds,0) valid_rounds,t.score,t.individual,t.wins,r.position,COALESCE(c.games,0) games,COALESCE(c.goals,0) goals,COALESCE(c.assists,0) assists,COALESCE(c.tackles,0) tackles,COALESCE(c.saves,0) saves
  FROM public.profiles p LEFT JOIN totals t ON t.player_id=p.id LEFT JOIN ranked r ON r.player_id=p.id LEFT JOIN awards a ON a.player_id=p.id LEFT JOIN career c ON c.player_id=p.id
 ) SELECT jsonb_build_object('players',COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.position NULLS LAST,p.nickname,p.id) FROM players p),'[]'::jsonb),'excluded',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',c.id,'title',COALESCE(c.title,'Pelada'),'round',c.round_number,'reason',COALESCE(c.reason,'Atleta não terminou confirmado em campo'))) FROM checks c JOIN public.match_players p ON p.match_id=c.id WHERE p.player_id=auth.uid() AND (c.reason IS NOT NULL OR p.presence<>'confirmed' OR p.final_team IS NULL OR p.final_team NOT IN ('colete','sem_colete'))),'[]'::jsonb),'minimum_peladas',5,'minimum_seconds',480,'updated_at',now()) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.competitive_ranking() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.competitive_ranking() TO authenticated;
