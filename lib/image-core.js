/*
  Script Room free image generation on your own Cloudflare site (Workers AI).
  Uses Flux-1 Schnell. Cloudflare gives every account 10,000 free "neurons" a day;
  one 1024x1024 image costs about 58, so roughly 170 free images a day for everyone
  using your site together. After that Cloudflare stops or bills, depending on your plan.
  Needs the Workers AI binding "AI" (already in wrangler.jsonc).
*/
const MODEL = '@cf/black-forest-labs/flux-1-schnell';
function json(o, status = 200) { return new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }
export async function handleImage(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'This service only serves its own site.' }, 403);
  if (url.pathname.endsWith('/health')) return json({ ok: true, ready: !!(env && env.AI), model: MODEL });
  if (!env || !env.AI) return json({ error: 'not_configured', message: 'Free images are not switched on for this site (Workers AI binding missing).' }, 501);
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  let b; try { b = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const prompt = String(b.prompt || '').slice(0, 2048);
  if (!prompt.trim()) return json({ error: 'no_prompt' }, 400);
  try {
    const out = await env.AI.run(MODEL, { prompt, steps: 4, seed: Number.isFinite(+b.seed) ? +b.seed : undefined });
    if (!out || !out.image) return json({ error: 'no_image', message: 'No image came back.' }, 502);
    return json({ image: out.image, mime: 'image/jpeg' });
  } catch (e) {
    const msg = String(e && e.message || e);
    const quota = /limit|quota|neuron|429/i.test(msg);
    return json({ error: quota ? 'quota' : 'failed', message: quota ? 'Today’s free images on this site are used up. Try again tomorrow, or connect your own image generator.' : 'The free image generator had a problem. Try again.' }, quota ? 429 : 500);
  }
}
