// Cloudflare Pages route for /api/share/* (the Worker setup uses worker.js instead).
import { handleShare } from '../../../lib/share-core.js';
export function onRequest({ request, env }) { return handleShare(request, env); }
