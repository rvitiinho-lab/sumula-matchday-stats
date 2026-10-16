"""Run against the local backend using an existing authenticated test session."""
import json
import os
import requests

with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as file:
    session = json.load(file)['session']
url = os.environ['SUPABASE_URL'].rstrip('/') + '/rest/v1'
public = {'apikey': os.environ['SUPABASE_PUBLISHABLE_KEY']}
headers = {**public, 'Authorization': 'Bearer ' + session['access_token'], 'Prefer': 'return=representation'}
mid = None
try:
    result = requests.post(url + '/rpc/create_pelada', headers=headers, json={'_title': 'Conferência temporária do chat', '_modality': 'x1'})
    result.raise_for_status()
    mid = result.json()
    rows = requests.get(url + '/match_players', headers=headers, params={'match_id': 'eq.' + mid}).json()
    assert len(rows) == 1 and rows[0]['team'] == 'colete' and rows[0]['queue_status'] == 'ACTIVE'
    blocked = requests.post(url + '/match_chat_messages', headers=headers, json={'match_id': mid, 'player_id': session['user']['id'], 'message': 'vou te matar'})
    assert blocked.status_code >= 400 and 'Mensagem bloqueada por conter termos inadequados' in blocked.text
    allowed = requests.post(url + '/match_chat_messages', headers=headers, json={'match_id': mid, 'player_id': session['user']['id'], 'message': 'foda carai poha mano'})
    allowed.raise_for_status()
    owner = requests.get(url + '/match_chat_messages', headers=headers, params={'match_id': 'eq.' + mid})
    assert len(owner.json()) == 1
    anon = requests.get(url + '/match_chat_messages', headers=public, params={'match_id': 'eq.' + mid})
    assert anon.status_code >= 400 or anon.json() == []
    send = requests.post(url + '/match_chat_messages', headers=public, json={'match_id': mid, 'player_id': session['user']['id'], 'message': 'mano'})
    assert send.status_code >= 400
    print('PASS: atomic creation, automatic starter, server moderation, owner read and anonymous denial')
finally:
    if mid:
        cleanup = requests.delete(url + '/matches', headers=headers, params={'id': 'eq.' + mid})
        cleanup.raise_for_status()