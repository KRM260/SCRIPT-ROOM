/* Run the real axe-core audit against a built Script Room page.
 *
 *   npm i -D playwright axe-core
 *   npx playwright install chromium
 *   SR_FILE=/full/path/to/index.html node tests/a11y-axe.js
 *
 * It opens the landing screen, then every stage in English, Arabic and German, in light and dark mode,
 * and prints violations at WCAG 2.2 AA level. Exit code 1 if any serious or critical violation is found.
 *
 * NOTE: run once by the author with axe-core 4.10.3 on the stages (no serious or critical violations).
 * The homemade checks in a11y-lib.js / a11y-run.js were run instead. Run this one before you rely on any claim of
 * "axe clean".
 */
const { chromium } = require('playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
(async () => {
  const file = process.env.SR_FILE; if (!file) { console.error('Set SR_FILE'); process.exit(2); }
  const browser = await chromium.launch(); let bad = 0; const seen = new Set();
  for (const lang of ['en', 'ar', 'de']) for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
    const page = await ctx.newPage(); await page.route(/^https?:/, (r) => r.abort());
    await page.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'${lang}',landed:true,langChosen:true}))`);
    await page.goto('file://' + file); await page.waitForTimeout(900);
    const states = [['start', async () => {}]];
    for (let i = 0; i < 7; i++) states.push(['stage' + (i + 1), async () => { await page.locator('#v3rail .v3-tab').nth(i).click(); await page.waitForTimeout(600); }]);
    for (const [name, step] of states) {
      await step(); await page.addScriptTag({ content: axeSrc });
      const r = await page.evaluate((tags) => axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
      for (const v of r.violations) {
        const key = [v.id, lang, scheme, name].join('|'); if (seen.has(key)) continue; seen.add(key);
        console.log(`[${lang}/${scheme}/${name}] ${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes)\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n   ')}`);
        if (v.impact === 'serious' || v.impact === 'critical') bad++;
      }
    }
    await ctx.close();
  }
  console.log(bad ? `\n${bad} serious/critical violation groups` : '\nNo serious or critical violations');
  await browser.close(); process.exit(bad ? 1 : 0);
})();
