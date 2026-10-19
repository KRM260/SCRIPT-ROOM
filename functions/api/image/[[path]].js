// Cloudflare Pages route for /api/image/* (needs a Workers AI binding named AI in the Pages project settings).
import { handleImage } from '../../../lib/image-core.js';
export function onRequest({ request, env }) { return handleImage(request, env); }
