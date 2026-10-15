import asyncio,json,os
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True); context=await browser.new_context(); page=await context.new_page()
  session_path=os.environ.get('LOVABLE_TEST_SESSION_FILE',os.path.expanduser('~/.cache/lovable-auth/session.json'))
  with open(session_path) as f: session=json.load(f)
  await page.goto('http://localhost:8080')
  await page.evaluate('(x)=>localStorage.setItem(x.key,x.session)',{'key':session['storage_key'],'session':json.dumps(session['session'])})
  await page.goto('http://localhost:8080/ranking',wait_until='networkidle')
  result=await page.evaluate('''async()=>{
   const {supabase:s}=await import('/src/integrations/supabase/client.ts');
   const {data:{user}}=await s.auth.getUser(); const checks={}; let mid;
   try {
    const created=await s.from('matches').insert({creator_id:user.id,modality:'x1',title:'Conferência temporária de integridade'}).select('id').single(); if(created.error)throw Error(created.error.message); mid=created.data.id;
    const join=await s.rpc('set_presence',{_match:mid,_presence:'confirmed'}); if(join.error)throw Error(join.error.message);
    const score=await s.from('matches').update({score_team_a:9}).eq('id',mid); checks.directScoreBlocked=!!score.error;
    const stat=await s.from('match_players').update({goals:9}).eq('match_id',mid); checks.directStatsBlocked=!!stat.error;
    const clock=await s.from('matches').update({clock_seconds:480}).eq('id',mid); checks.directClockBlocked=!!clock.error;
    const start=await s.rpc('operate_match_clock',{_match:mid,_action:'start'}); if(start.error)throw Error(start.error.message);
    const args={_id:crypto.randomUUID(),_match:mid,_player:user.id,_team:'colete',_type:'goal',_minute:0,_difficult:false};
    const first=await s.rpc('record_match_event',args); if(first.error)throw Error(first.error.message);
    const retry=await s.rpc('record_match_event',args); if(retry.error)throw Error(retry.error.message);
    const ev=await s.from('match_events').select('id').eq('match_id',mid); checks.retrySavedOnce=ev.data.length===1;
    const m=await s.from('matches').select('score_team_a').eq('id',mid).single(); checks.atomicScore=m.data.score_team_a===1;
    const correction=await s.rpc('correct_match_record',{_match:mid,_field:'score_team_a',_value:2}); if(correction.error)throw Error(correction.error.message);
    const audit=await s.from('matches').select('correction_audit').eq('id',mid).single(); checks.correctionAudited=audit.data.correction_audit.length===1;
    const future=await s.rpc('record_match_event',{...args,_id:crypto.randomUUID(),_minute:999}); checks.futureEventBlocked=!!future.error;
    const ranking=await s.rpc('competitive_ranking'); if(ranking.error)throw Error(ranking.error.message); checks.unfinishedExcluded=ranking.data.excluded.some(r=>r.id===mid);
    const undo=await s.from('match_events').delete().eq('id',args._id); if(undo.error)throw Error(undo.error.message);
   } finally { if(mid){const removed=await s.from('matches').delete().eq('id',mid);checks.temporaryRemoved=!removed.error;} }
   return checks;
  }''')
  print('Creator integrity checks:',result)
  if not all(result.values()): raise Exception('Integrity check failed')
  anon=await browser.new_context(); ap=await anon.new_page(); await ap.goto('http://localhost:8080')
  blocked=await ap.evaluate("async()=>{const {supabase:s}=await import('/src/integrations/supabase/client.ts');return !!(await s.rpc('competitive_ranking')).error}")
  assert blocked, 'Anonymous ranking access must be denied'
  print('Anonymous ranking blocked:',blocked)
  await browser.close()
asyncio.run(main())
