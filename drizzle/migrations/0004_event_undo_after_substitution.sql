CREATE OR REPLACE FUNCTION public.apply_match_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev public.match_events; delta integer; col text; current_status text;
BEGIN
 IF TG_OP='INSERT' THEN ev:=NEW; delta:=1; ELSE ev:=OLD; delta:=-1; END IF;
 SELECT status INTO current_status FROM public.matches WHERE id=ev.match_id FOR UPDATE;
 IF NOT public.is_match_creator(ev.match_id) OR current_status<>'in_progress' THEN RAISE EXCEPTION 'Only the organizer can record events in a live match'; END IF;
 IF TG_OP='INSERT' AND NOT EXISTS (SELECT 1 FROM public.match_players WHERE match_id=ev.match_id AND player_id=ev.player_id AND team=ev.team AND presence='confirmed' AND team IN ('colete','sem_colete')) THEN RAISE EXCEPTION 'Player not on the field'; END IF;
 col:=CASE ev.type WHEN 'goal' THEN 'goals' WHEN 'assist' THEN 'assists' WHEN 'tackle' THEN 'tackles' WHEN 'shot_on_goal' THEN 'shots_on_goal' WHEN 'foul_suffered' THEN 'fouls_suffered' WHEN 'foul_committed' THEN 'fouls_committed' WHEN 'save' THEN 'saves' END;
 IF col IS NULL OR ev.minute<0 THEN RAISE EXCEPTION 'Invalid event'; END IF;
 EXECUTE format('UPDATE public.match_players SET %I=GREATEST(0,COALESCE(%I,0)+$1) WHERE match_id=$2 AND player_id=$3',col,col) USING delta,ev.match_id,ev.player_id;
 IF ev.type='goal' THEN
  IF ev.team='colete' THEN UPDATE public.matches SET score_team_a=GREATEST(0,COALESCE(score_team_a,0)+delta) WHERE id=ev.match_id;
  ELSE UPDATE public.matches SET score_team_b=GREATEST(0,COALESCE(score_team_b,0)+delta) WHERE id=ev.match_id; END IF;
 END IF;
 IF TG_OP='INSERT' THEN RETURN NEW; ELSE RETURN OLD; END IF;
END $$;