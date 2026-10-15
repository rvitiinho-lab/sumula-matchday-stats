-- Run with psql and ON_ERROR_STOP=1. All writes are reverted.
BEGIN;
SELECT id AS athlete FROM public.profiles ORDER BY created_at LIMIT 1 \gset
SELECT set_config('request.jwt.claims', json_build_object('sub', :'athlete', 'role', 'authenticated')::text, true) IS NOT NULL;
INSERT INTO public.matches(creator_id,modality,title) VALUES(:'athlete','x1','Transação descartável de proteção') RETURNING id AS match_id \gset
SELECT set_config('test.match', :'match_id', true) IS NOT NULL;
DO $$ BEGIN
 BEGIN UPDATE public.matches SET score_team_a=9 WHERE id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: direct score accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Use a operação autorizada%' THEN RAISE; END IF; END;
 BEGIN UPDATE public.matches SET clock_seconds=480 WHERE id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: direct clock accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Use a operação autorizada%' THEN RAISE; END IF; END;
END $$;
UPDATE public.matches SET status='finished' WHERE id=:'match_id';
DO $$ BEGIN
 BEGIN DELETE FROM public.matches WHERE id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: finished delete accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Resultados encerrados não podem ser apagados%' THEN RAISE; END IF; END;
END $$;
ROLLBACK;