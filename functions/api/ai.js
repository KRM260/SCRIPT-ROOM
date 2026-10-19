/*
  Script Room AI relay (Cloudflare Pages Function, route: /api/ai)

  Some AI providers refuse requests that come straight from a browser.
  This function forwards the browser's request to the provider the user
  picked and streams the answer back. It stores nothing and logs nothing.
  The user's API key travels in the request headers, exactly as it would
  if the browser called the provider directly.

  Only the providers listed below are allowed, so the relay cannot be
  used to reach any other site. Local models (Ollama, LM Studio) are
  called directly by the browser and never pass through here.
*/
const ALLOWED = new Set([
  'api.anthropic.com',
  'api.openai.com',
  'generativelanguage.googleapis.com',
  'api.deepseek.com',
  'api.mistral.ai',
  'api.groq.com',
  'openrouter.ai'
]);
const PASS = ['content-type', 'authorization', 'x-api-key', 'anthropic-version', 'http-referer', 'x-title'];

export async function onRequestPost({ request }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return new Response('This relay only serves its own site.', { status: 403 });
  }
  let target;
  try { target = new URL(request.headers.get('x-target') || ''); }
  catch { return new Response('Missing or invalid x-target header.', { status: 400 }); }
  if (target.protocol !== 'https:' || !ALLOWED.has(target.hostname)) {
    return new Response('That provider is not on the relay list.', { status: 403 });
  }
  const headers = new Headers();
  for (const k of PASS) { const v = request.headers.get(k); if (v) headers.set(k, v); }
  const upstream = await fetch(target.toString(), { method: 'POST', headers, body: request.body });
  const out = new Headers();
  for (const k of ['content-type', 'cache-control']) { const v = upstream.headers.get(k); if (v) out.set(k, v); }
  out.set('cache-control', 'no-store');
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export function onRequest() {
  return new Response('Use POST.', { status: 405, headers: { allow: 'POST' } });
}
