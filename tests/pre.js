// Shared launcher for the V4 tests. Needs: npm i -D playwright   (jszip optional: npm i -D jszip, or run with ONLINE=1)
const { chromium } = require('playwright');
let jszipPath = null; try { jszipPath = require.resolve('jszip/dist/jszip.min.js'); } catch (e) {}
module.exports = async function (opts) {
  opts = opts || {};
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: opts.w || 1400, height: opts.h || 900 }, acceptDownloads: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.route(/^https?:/, r => {
    const u = r.request().url();
    if (/^http:\/\/127\.0\.0\.1[:\/]/.test(u)) return r.continue();
    if (/jszip\.min\.js/.test(u) && jszipPath) return r.fulfill({ path: jszipPath, contentType: 'application/javascript' });
    if (process.env.ONLINE) return r.continue();
    return opts.route ? opts.route(r) : r.abort();
  });
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'${opts.lang || 'en'}',landed:true,langChosen:true}));`);
  await p.goto('file://' + process.env.SR_FILE); await p.waitForTimeout(800);
  return { b, ctx, p, errs };
};
