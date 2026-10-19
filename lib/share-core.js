/*
  Script Room share links and Write together (Cloudflare KV).

  Each shared project gets an unguessable id and two random keys:
    - a view key (read only)
    - an edit key (read and save)
  Links carry the key after "#", so it never reaches server logs.
  The server stores only SHA-256 hashes of the keys, never the keys.
  Every save carries the version it was based on. If someone else saved
  in between, the server answers 409 with their version and nothing is
  overwritten: the app asks the person what to do.

  Needs a KV namespace bound as SHARES (see README, "Share links and
  Write together"). Without it the endpoints answer 501 and the app
  explains how to switch the feature on.
*/
const MAX = 5 * 1024 * 1024;
const enc = new TextEncoder();
function json(o, status = 200) { return new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }
function rand(n) { const b = new Uint8Array(n); crypto.getRandomValues(b); return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', enc.encode(String(s || ''))); return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const okId = id => /^[A-Za-z0-9_-]{16,40}$/.test(id || '');

export async function handleShare(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'This service only serves its own site.' }, 403);
  const parts = url.pathname.replace(/^\/api\/share\/?/, '').split('/').filter(Boolean);
  const kv = env && env.SHARES;
  if (parts[0] === 'health') return json({ ok: true, ready: !!kv });
  if (!kv) return json({ error: 'not_configured', message: 'Share links are not switched on for this site yet.' }, 501);

  const method = request.method;
  async function body() {
    const t = await request.text();
    if (t.length > MAX) throw new Response(JSON.stringify({ error: 'too_large', message: 'This project is too big to share (over 5 MB). Remove large photos and try again.' }), { status: 413 });
    try { return JSON.parse(t || '{}'); } catch { throw json({ error: 'bad_json' }, 400); }
  }
  try {
    if (!parts.length && method === 'POST') {
      const b = await body();
      if (!b.data || typeof b.data !== 'object') return json({ error: 'no_data' }, 400);
      const id = rand(18), viewKey = rand(24), editKey = rand(24), now = Date.now();
      await kv.put('p:' + id, JSON.stringify({ ver: 1, data: b.data, name: String(b.name || '').slice(0, 200), updatedAt: now, vh: await sha(viewKey), eh: await sha(editKey) }));
      return json({ id, viewKey, editKey, ver: 1, updatedAt: now });
    }
    const id = parts[0];
    if (!okId(id)) return json({ error: 'not_found' }, 404);
    const raw = await kv.get('p:' + id);
    if (!raw) return json({ error: 'not_found', message: 'This link no longer works. The owner may have stopped sharing.' }, 404);
    const rec = JSON.parse(raw);
    const kh = await sha(request.headers.get('x-key'));
    const canEdit = kh === rec.eh, canView = canEdit || kh === rec.vh;
    if (!canView) return json({ error: 'not_found', message: 'This link no longer works. The owner may have stopped sharing.' }, 404);

    if (parts[1] === 'rotate' && method === 'POST') {
      if (!canEdit) return json({ error: 'read_only' }, 403);
      const viewKey = rand(24), editKey = rand(24);
      rec.vh = await sha(viewKey); rec.eh = await sha(editKey);
      await kv.put('p:' + id, JSON.stringify(rec));
      return json({ id, viewKey, editKey, ver: rec.ver });
    }
    if (method === 'GET') {
      const since = +url.searchParams.get('since') || 0;
      if (since && since >= rec.ver) return json({ ver: rec.ver, updatedAt: rec.updatedAt, unchanged: true, canEdit });
      return json({ ver: rec.ver, data: rec.data, name: rec.name, updatedAt: rec.updatedAt, canEdit });
    }
    if (method === 'PUT') {
      if (!canEdit) return json({ error: 'read_only', message: 'This link can only view the project.' }, 403);
      const b = await body();
      if (+b.baseVer !== rec.ver && !b.force) return json({ error: 'conflict', ver: rec.ver, data: rec.data, updatedAt: rec.updatedAt }, 409);
      rec.ver += 1; rec.data = b.data; rec.updatedAt = Date.now(); if (b.name != null) rec.name = String(b.name).slice(0, 200);
      await kv.put('p:' + id, JSON.stringify(rec));
      return json({ ver: rec.ver, updatedAt: rec.updatedAt });
    }
    if (method === 'DELETE') {
      if (!canEdit) return json({ error: 'read_only' }, 403);
      await kv.delete('p:' + id);
      return json({ ok: true });
    }
    return json({ error: 'method' }, 405);
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ error: 'server', message: 'The share service had a problem. Try again.' }, 500);
  }
}
