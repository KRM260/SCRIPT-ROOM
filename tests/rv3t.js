const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();
const res=[];
for(const [k,rx] of [['TVC',/^TVC/],['Social',/^Social/],['Podcast',/^Podcast/],['Music video',/^Music video/],['Documentary',/^Documentary/],['Feature film',/^Feature film/]]){
const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());await p.emulateMedia({reducedMotion:'reduce'});
await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'en',landed:true,langChosen:true}));`);
await p.goto('file://'+process.env.SR_FILE);await p.waitForTimeout(800);
await p.evaluate(()=>document.getElementById('btnNew').click());await p.waitForTimeout(700);
const c=p.locator('.ld-card,.type-card').filter({hasText:rx}).first();if(!(await c.count())){res.push('SKIP '+k+' (card not found)');await p.close();continue}
await c.click();await p.waitForTimeout(900);if(await p.locator('.askov').count())await p.locator('.askov .btn.primary').click().catch(()=>{});await p.waitForTimeout(500);
const rail=await p.evaluate(()=>[...document.querySelectorAll('#v3rail .v3-tab b')].map(x=>x.textContent).join(' > '));
// walk Next to the end
const seq=[];for(let i=0;i<10;i++){seq.push(await p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b')?.textContent));const nx=p.locator('.pfoot .btn.primary');if(!(await nx.count()))break;await nx.click();await p.waitForTimeout(400)}
res.push((errs.length?'FAIL ':'PASS ')+k+': rail = '+rail+' | walk = '+seq.join(' › ')+(errs.length?' ERR '+errs[0]:''));await p.close()}
console.log(res.join('\n'));await b.close()})();
