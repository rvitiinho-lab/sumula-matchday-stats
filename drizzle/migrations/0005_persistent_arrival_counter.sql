ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS arrival_counter integer NOT NULL DEFAULT 0;
UPDATE public.matches m SET arrival_counter=COALESCE((SELECT MAX(arrival_order) FROM public.match_players WHERE match_id=m.id),0);
CREATE OR REPLACE FUNCTION public.guard_match_arrival() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE state text;
BEGIN
 SELECT status INTO state FROM public.matches WHERE id=NEW.match_id FOR UPDATE;
 IF TG_OP='INSERT' THEN
  IF state NOT IN ('open','in_progress') THEN RAISE EXCEPTION 'Esta partida não aceita novos atletas'; END IF;
  UPDATE public.matches SET arrival_counter=arrival_counter+1 WHERE id=NEW.match_id RETURNING arrival_counter INTO NEW.arrival_order;
  NEW.queue_position:=NEW.arrival_order;
  NEW.queue_status:=CASE WHEN NEW.presence='confirmed' THEN 'QUEUED' ELSE 'LEFT' END;
  NEW.team:='unassigned'; NEW.queue_index:=NULL;
 ELSE
  IF NEW.arrival_order IS DISTINCT FROM OLD.arrival_order OR NEW.match_id IS DISTINCT FROM OLD.match_id OR NEW.player_id IS DISTINCT FROM OLD.player_id THEN RAISE EXCEPTION 'A ordem de chegada não pode ser alterada'; END IF;
 END IF;
 RETURN NEW;
END $$;