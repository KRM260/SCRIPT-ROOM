/*
  Script Room on Cloudflare Workers.
  Serves the app files, and runs the AI relay at /api/ai
  (the same relay as functions/api/ai.js, which Cloudflare Pages uses),
  and share links / Write together at /api/share (lib/share-core.js).
*/
import { onRequestPost } from './functions/api/ai.js';
import { handleShare } from './lib/share-core.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/ai') {
      if (request.method === 'POST') return onRequestPost({ request });
      return new Response('Use POST.', { status: 405, headers: { allow: 'POST' } });
    }
    if (url.pathname === '/api/share' || url.pathname.startsWith('/api/share/')) return handleShare(request, env);
    return env.ASSETS.fetch(request);
  }
};
