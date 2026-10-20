const { chromium } = require('playwright');
const { A11Y_FN } = require('./a11y-lib.js');
(async () => {
  const L = process.env.LANG2 || 'en', W = +(process.env.W || 1400), THEME = process.env.THEME || '';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: 900 }, colorScheme: THEME === 'dark' ? 'dark' : 'light' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.route(/^https?:/, (r) => r.abort()); await p.emulateMedia({ reducedMotion: 'reduce' });
  const landed = process.env.LANDING ? 'false' : 'true';
  await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'${L}',landed:${landed},langChosen:true${THEME ? ",theme:'" + THEME + "'" : ''}}));`);
  await p.goto('file://' + process.env.SR_FILE); await p.waitForTimeout(900);
  const agg = {}; const rec = (state, res) => { Object.keys(res).forEach((r) => { if (r === '__stats') return; (agg[r] = agg[r] || []).push(...res[r].map((x) => state + ': ' + x)); }); };
  const run = async (state) => { const res = await p.evaluate(A11Y_FN); rec(state, res); return res; };
  if (process.env.LANDING) { await p.waitForTimeout(600); await run('landing'); }
  else {
    await p.evaluate(() => document.getElementById('btnExample').click()); await p.waitForTimeout(1100);
    if (await p.locator('.askov').count()) await p.locator('.askov .btn.primary').click(); await p.waitForTimeout(500);
    const S = process.env.GO || 'go';
    for (let i = 0; i < 8; i++) {
      await p.evaluate((i) => { const n = document.querySelectorAll('#nav .tab'); n[i] && n[i].click(); }, i); await p.waitForTimeout(700);
      await run('step' + i);
    }
    for (const [nm, id] of [['shotboard', 'btnShotBoard'], ['cards', 'btnBoard']]) {
      await p.evaluate((id) => document.getElementById(id).click(), id); await p.waitForTimeout(800); await run(nm);
      await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    }
    await p.evaluate(() => document.getElementById('btnPal').click()); await p.waitForTimeout(400); await run('palette'); await p.keyboard.press('Escape');

    await p.evaluate(() => document.getElementById('btnExport').click()); await p.waitForTimeout(700); await run('export-sheet');
    await p.evaluate(() => { const bs=[...document.querySelectorAll('#sheet .stack > .bar:last-child .btn')]; if(bs[0]) bs[0].click(); }); await p.waitForTimeout(600); console.log('rev sheet title:',await p.locator('#sheet h2').innerText().catch(()=>'')); await run('revisions-unlocked');
    await p.evaluate(() => { const b=[...document.querySelectorAll('#sheet .btn.primary')][0]; if(b) b.click(); }); await p.waitForTimeout(400);
    if (await p.locator('.askov').count()) { await run('ask-dialog'); await p.locator('.askov .btn.primary').click(); } await p.waitForTimeout(500); await run('revisions-locked');
    await p.evaluate(() => { const b=[...document.querySelectorAll('#sheet .btn.primary')][0]; if(b) b.click(); }); await p.waitForTimeout(400);
    if (await p.locator('.askov').count()) await p.locator('.askov .btn.primary').click(); await p.waitForTimeout(500); await run('revisions-blue-started');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.evaluate(() => { const n=document.querySelectorAll('#nav .tab'); n[8] && n[8].click(); }); await p.waitForTimeout(700); await run('review-with-cards');
    await p.evaluate(() => { const cs=document.querySelectorAll('.v3-cards .v3-card'); const b=cs[4]&&cs[4].querySelector('.btn'); if(b) b.click(); }); await p.waitForTimeout(600); const _t=await p.locator('#sheet h2').innerText().catch(()=>''); console.log('mcp sheet title:',_t); await run('mcp-sheet');
    await p.fill('#mcp-url','not a url').catch(()=>{}); await p.evaluate(() => { const b=[...document.querySelectorAll('#sheet .btn.primary')].pop(); if(b) b.click(); }); await p.waitForTimeout(400); await run('mcp-error');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.click('#btnAI').catch(() => {}); await p.waitForTimeout(500); await run('ai-sheet'); await p.keyboard.press('Escape');
  }
  const sum = Object.keys(agg).sort().map((r) => ({ rule: r, n: agg[r].length, ex: [...new Set(agg[r].map((x) => x.replace(/^[^:]+: /, '')))].slice(0, +(process.env.EXN||4)) }));
  sum.forEach((s) => console.log(String(s.n).padStart(4), s.rule, '\n      ' + s.ex.join('\n      ')));
  console.log('RULES', sum.length, 'ERRS', errs.length, errs.slice(0, 3)); await b.close();
})();
