/*
  Script Room on Cloudflare Workers.
  Serves the app files, and runs the AI relay at /api/ai
  (the same relay as functions/api/ai.js, which Cloudflare Pages uses).
*/
import { onRequestPost } from './functions/api/ai.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/ai') {
      if (request.method === 'POST') return onRequestPost({ request });
      return new Response('Use POST.', { status: 405, headers: { allow: 'POST' } });
    }
    return env.ASSETS.fetch(request);
  }
};
