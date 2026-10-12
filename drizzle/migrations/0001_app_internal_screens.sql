ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS voting_closed boolean NOT NULL DEFAULT false;

ALTER TABLE public.match_players
  ADD COLUMN IF NOT EXISTS presence varchar(12) NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS tackles integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shots_on_goal integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fouls_suffered integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fouls_committed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position varchar(3) NOT NULL DEFAULT 'MEI';

CREATE OR REPLACE FUNCTION public.is_match_player(_match uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.match_players WHERE match_id = _match AND player_id = _user AND team IN ('colete','sem_colete'))
$$;

CREATE OR REPLACE FUNCTION public.match_voting_open(_match uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.matches WHERE id = _match AND status = 'finished' AND NOT voting_closed)
$$;

CREATE OR REPLACE FUNCTION public.set_presence(_match uuid, _presence text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nxt int;
BEGIN
  IF auth.uid() IS NULL OR _presence NOT IN ('confirmed','declined') THEN RAISE EXCEPTION 'invalid'; END IF;
  IF EXISTS (SELECT 1 FROM public.match_players WHERE match_id=_match AND player_id=auth.uid()) THEN
    UPDATE public.match_players SET presence=_presence,
      team = CASE WHEN _presence='declined' THEN 'unassigned' ELSE team END
    WHERE match_id=_match AND player_id=auth.uid();
  ELSE
    SELECT COALESCE(MAX(queue_position),0)+1 INTO nxt FROM public.match_players WHERE match_id=_match;
    INSERT INTO public.match_players(match_id, player_id, queue_position, presence) VALUES (_match, auth.uid(), nxt, _presence);
  END IF;
END $$;

CREATE TABLE public.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team varchar(20) NOT NULL,
  type varchar(20) NOT NULL CHECK (type IN ('goal','assist','tackle','shot_on_goal','foul_suffered','foul_committed','save')),
  minute integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.match_events TO anon;
GRANT SELECT, INSERT, DELETE ON public.match_events TO authenticated;
GRANT ALL ON public.match_events TO service_role;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events readable" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "creator adds events" ON public.match_events FOR INSERT TO authenticated WITH CHECK (public.is_match_creator(match_id));
CREATE POLICY "creator removes events" ON public.match_events FOR DELETE TO authenticated USING (public.is_match_creator(match_id));

CREATE TABLE public.match_ratings (
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rated_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 1 AND 10),
  PRIMARY KEY (match_id, rater_id, rated_id),
  CHECK (rater_id <> rated_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_ratings TO authenticated;
GRANT ALL ON public.match_ratings TO service_role;
ALTER TABLE public.match_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ratings read" ON public.match_ratings FOR SELECT TO authenticated USING (rater_id = auth.uid());
CREATE POLICY "rate insert" ON public.match_ratings FOR INSERT TO authenticated WITH CHECK (
  rater_id = auth.uid() AND public.match_voting_open(match_id) AND public.is_match_player(match_id, auth.uid()) AND public.is_match_player(match_id, rated_id));
CREATE POLICY "rate update" ON public.match_ratings FOR UPDATE TO authenticated USING (rater_id = auth.uid() AND public.match_voting_open(match_id))
  WITH CHECK (rater_id = auth.uid() AND public.match_voting_open(match_id));

CREATE TABLE public.match_votes (
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category varchar(10) NOT NULL CHECK (category IN ('craque','bagre','muralha')),
  voted_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (match_id, voter_id, category),
  CHECK (voter_id <> voted_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_votes TO authenticated;
GRANT ALL ON public.match_votes TO service_role;
ALTER TABLE public.match_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own votes read" ON public.match_votes FOR SELECT TO authenticated USING (voter_id = auth.uid());
CREATE POLICY "vote insert" ON public.match_votes FOR INSERT TO authenticated WITH CHECK (
  voter_id = auth.uid() AND public.match_voting_open(match_id) AND public.is_match_player(match_id, auth.uid()) AND public.is_match_player(match_id, voted_id));
CREATE POLICY "vote update" ON public.match_votes FOR UPDATE TO authenticated USING (voter_id = auth.uid() AND public.match_voting_open(match_id))
  WITH CHECK (voter_id = auth.uid() AND public.match_voting_open(match_id) AND public.is_match_player(match_id, voted_id));

CREATE OR REPLACE FUNCTION public.match_results(_match uuid)
RETURNS TABLE(player_id uuid, avg_score numeric, raters integer, craque integer, bagre integer, muralha integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT mp.player_id,
    (SELECT ROUND(AVG(score)::numeric,1) FROM match_ratings r WHERE r.match_id=_match AND r.rated_id=mp.player_id),
    (SELECT COUNT(*)::int FROM match_ratings r WHERE r.match_id=_match AND r.rated_id=mp.player_id),
    (SELECT COUNT(*)::int FROM match_votes v WHERE v.match_id=_match AND v.voted_id=mp.player_id AND v.category='craque'),
    (SELECT COUNT(*)::int FROM match_votes v WHERE v.match_id=_match AND v.voted_id=mp.player_id AND v.category='bagre'),
    (SELECT COUNT(*)::int FROM match_votes v WHERE v.match_id=_match AND v.voted_id=mp.player_id AND v.category='muralha')
  FROM match_players mp
  WHERE mp.match_id=_match AND mp.team IN ('colete','sem_colete')
    AND EXISTS (SELECT 1 FROM matches m WHERE m.id=_match AND m.voting_closed)
$$;

CREATE OR REPLACE FUNCTION public.match_voting_progress(_match uuid)
RETURNS TABLE(voters integer, eligible integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT COUNT(DISTINCT voter_id)::int FROM match_votes WHERE match_id=_match),
         (SELECT COUNT(*)::int FROM match_players WHERE match_id=_match AND team IN ('colete','sem_colete'))
$$;

-- Overall rule: new = clamp(round(0.8*old + 0.2*avg_score*10), 40, 99), applied once when the organizer closes voting.
CREATE OR REPLACE FUNCTION public.close_voting(_match uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_match_creator(_match) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.match_voting_open(_match) THEN RAISE EXCEPTION 'voting not open'; END IF;
  UPDATE public.profiles p SET overall_rating = LEAST(99, GREATEST(40, ROUND(0.8*p.overall_rating + 0.2*a.avg*10)))
  FROM (SELECT rated_id, AVG(score) avg FROM public.match_ratings WHERE match_id=_match GROUP BY rated_id) a
  WHERE p.id = a.rated_id;
  UPDATE public.matches SET voting_closed = true WHERE id = _match;
END $$;

REVOKE EXECUTE ON FUNCTION public.close_voting(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_presence(uuid, text) FROM anon;