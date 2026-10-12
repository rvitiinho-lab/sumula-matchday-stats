CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  apelido TEXT UNIQUE NOT NULL,
  overall_rating INTEGER DEFAULT 70 CHECK (overall_rating BETWEEN 1 AND 99),
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id),
  title TEXT,
  modality VARCHAR(10) NOT NULL CHECK (modality IN ('x1','x2','x5','x6','x7','x11')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in_progress','finished')),
  score_team_a INTEGER DEFAULT 0,
  score_team_b INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches readable" ON public.matches FOR SELECT USING (true);
CREATE POLICY "create own match" ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "creator updates" ON public.matches FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "creator deletes" ON public.matches FOR DELETE TO authenticated USING (auth.uid() = creator_id);

CREATE TABLE public.match_players (
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  queue_position INTEGER NOT NULL,
  team VARCHAR(20) DEFAULT 'unassigned' CHECK (team IN ('colete','sem_colete','proxima_1','proxima_2','proxima_3','unassigned')),
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  PRIMARY KEY (match_id, player_id)
);
GRANT SELECT ON public.match_players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_players TO authenticated;
GRANT ALL ON public.match_players TO service_role;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_match_creator(_match UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.matches WHERE id = _match AND creator_id = auth.uid())
$$;

CREATE POLICY "players readable" ON public.match_players FOR SELECT USING (true);
CREATE POLICY "join self" ON public.match_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "creator manages players" ON public.match_players FOR UPDATE TO authenticated USING (public.is_match_creator(match_id));
CREATE POLICY "leave or creator removes" ON public.match_players FOR DELETE TO authenticated USING (auth.uid() = player_id OR public.is_match_creator(match_id));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base TEXT; final TEXT; n INT := 0;
BEGIN
  base := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'apelido', SPLIT_PART(NEW.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g');
  IF length(base) < 2 THEN base := 'atleta'; END IF;
  base := left(base, 16);
  final := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE apelido = final) LOOP
    n := n + 1; final := base || n;
  END LOOP;
  INSERT INTO public.profiles (id, nome, apelido, overall_rating)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', 'Atleta Súmula'), final, 70);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();