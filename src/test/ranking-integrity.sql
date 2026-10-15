-- Integration regression tests. All test operations are rolled back.
BEGIN;
SELECT id AS athlete FROM public.profiles ORDER BY created_at LIMIT 1 \gset
SELECT set_config('request.jwt.claims', json_build_object('sub', :'athlete', 'role', 'authenticated')::text, true) IS NOT NULL AS claims_ready;
SET LOCAL ROLE authenticated;
INSERT INTO public.matches(creator_id,modality,title) VALUES(:'athlete','x1','Transação de teste — não persistir') RETURNING id AS match_id \gset
SELECT public.set_presence(:'match_id','confirmed');
SELECT set_config('test.match', :'match_id', true) IS NOT NULL;
DO $$ BEGIN
 BEGIN UPDATE public.matches SET score_team_a=9 WHERE id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: direct score accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
 BEGIN UPDATE public.match_players SET goals=9 WHERE match_id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: direct stats accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
 BEGIN UPDATE public.matches SET clock_seconds=480 WHERE id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: direct clock accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
END $$;
SELECT public.operate_match_clock(:'match_id','start');
SELECT gen_random_uuid() AS event_id \gset
SELECT public.record_match_event(:'event_id',:'match_id',:'athlete','colete','goal',0,false);
SELECT public.record_match_event(:'event_id',:'match_id',:'athlete','colete','goal',0,false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.match_events WHERE match_id=current_setting('test.match')::uuid)<>1 THEN RAISE EXCEPTION 'TEST FAILED: retry duplicate'; END IF;
 IF (SELECT score_team_a FROM public.matches WHERE id=current_setting('test.match')::uuid)<>1 THEN RAISE EXCEPTION 'TEST FAILED: event score'; END IF;
END $$;
SELECT public.correct_match_record(:'match_id','score_team_a',2);
DO $$ BEGIN
 IF (SELECT jsonb_array_length(correction_audit) FROM public.matches WHERE id=current_setting('test.match')::uuid)<>1 THEN RAISE EXCEPTION 'TEST FAILED: missing correction audit'; END IF;
END $$;
SELECT public.operate_match_clock(:'match_id','pause');
UPDATE public.matches SET status='finished' WHERE id=:'match_id';
DO $$ BEGIN
 BEGIN DELETE FROM public.matches WHERE id=current_setting('test.match')::uuid; RAISE EXCEPTION 'TEST FAILED: finished delete accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
 BEGIN PERFORM public.correct_match_record(current_setting('test.match')::uuid,'score_team_a',3); RAISE EXCEPTION 'TEST FAILED: finished correction accepted'; EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
 IF (public.competitive_ranking()->>'minimum_seconds')::int<>480 THEN RAISE EXCEPTION 'TEST FAILED: 8 minute rule'; END IF;
 IF (public.competitive_ranking()->>'minimum_peladas')::int<>5 THEN RAISE EXCEPTION 'TEST FAILED: 5 peladas rule'; END IF;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{}',true) IS NOT NULL;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM public.competitive_ranking(); RAISE EXCEPTION 'TEST FAILED: anonymous ranking accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;