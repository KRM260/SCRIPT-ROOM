// i18n audit for V3 screens: reports English strings left visible when UI is AR or DE
const { chromium } = require('playwright');
(async()=>{const L=process.env.LANG2||'ar';const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1400,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());await p.emulateMedia({reducedMotion:'reduce'});
await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'${L}',landed:true,langChosen:true}));`);
await p.goto('file://'+process.env.SR_FILE+'#i18n-audit');await p.waitForTimeout(900);
await p.evaluate(()=>document.getElementById('btnExample').click());await p.waitForTimeout(700);if(await p.locator('.askov').count())await p.locator('.askov .btn.primary').click();await p.waitForTimeout(400);
for(let i=0;i<7;i++){await p.locator('#v3rail .v3-tab').nth(i).click();await p.waitForTimeout(500);await p.evaluate(()=>{document.querySelectorAll('.v3-about').forEach(d=>d.open=true)});await p.waitForTimeout(200);if(i===6){await p.screenshot({path:'aud3-review-'+L+'.png'})}if(i===1)await p.screenshot({path:'aud3-chars-'+L+'.png'})}
await p.evaluate(()=>{[...document.querySelectorAll('#stepPanel button')].find(b=>/Screenplay words|مصطلحات|Begriffe/.test(b.textContent))?.click()});await p.waitForTimeout(500);await p.screenshot({path:'aud3-gl-'+L+'.png'});
const miss=await p.evaluate(()=>Object.keys(window.__srMiss||{}));console.log(L,'misses',miss.length);console.log(JSON.stringify(miss));console.log(errs);await b.close()})();
