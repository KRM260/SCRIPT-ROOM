// V3 functional tests: rail, strip, order, review proxies, glossary, stage status, project types, board interplay
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());await p.emulateMedia({reducedMotion:'reduce'});
await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'en',landed:true,langChosen:true}));`);
await p.goto('file://'+process.env.SR_FILE);await p.waitForTimeout(800);
const res=[];const T=(n,ok,x)=>res.push((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));
// blank project first
await p.evaluate(()=>document.getElementById('btnBlank').click());await p.waitForTimeout(900);if(await p.locator('.askov').count())await p.locator('.askov .btn.primary').click();await p.waitForTimeout(500);
T('blank start: 7 stages in the rail',(await p.locator('#v3rail .v3-tab').count())===7);
const st0=await p.evaluate(()=>[...document.querySelectorAll('#v3rail .v3-tab')].map(t=>t.className.replace('v3-tab ','')).join());T('blank start: nothing marked done',!/done/.test(st0),st0);
T('blank start: Idea is current',await p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b').textContent==='Idea'));
// flow order via Next
const order=[];for(let i=0;i<9;i++){const h=await p.evaluate(()=>document.querySelector('#stepPanel h2').textContent);order.push(h);const nx=p.locator('.pfoot .btn.primary');if(!(await nx.count()))break;await nx.click();await p.waitForTimeout(500)}
T('Next walks all nine steps in stage order',order.length===9,order.join(' > '));
const cur=await p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b').textContent);T('last Next lands on Review',cur==='Review',cur);
T('Review: no Next button',(await p.locator('.pfoot .btn.primary').count())===0);
// back goes to previous in order (Script)
await p.locator('.pfoot .btn').first().click();await p.waitForTimeout(500);T('Back from Review returns to Shots',await p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b').textContent)==='Shots');
// load example, check statuses
await p.evaluate(()=>document.getElementById('btnExample').click());await p.waitForTimeout(900);if(await p.locator('.askov').count())await p.locator('.askov .btn.primary').click();await p.waitForTimeout(400);
const st1=await p.evaluate(()=>[...document.querySelectorAll('#v3rail .v3-tab')].map(t=>t.querySelector('b').textContent+':'+t.className.replace('v3-tab ','')).join(' '));res.push('INFO statuses after example: '+st1);
T('example: Idea, Characters, Structure, Dialogue, Shots done; Script not',/Idea:done/.test(st1)&&/Characters:done/.test(st1)&&/Structure:done/.test(st1)&&/Dialogue:done/.test(st1)&&/Script:todo/.test(st1)&&/Shots:done/.test(st1),st1);
// stage strip: sub-steps
await p.locator('#v3rail .v3-tab').nth(0).click();await p.waitForTimeout(500);
const subs=await p.evaluate(()=>[...document.querySelectorAll('#v3stage .v3-sb')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).join('|'));T('Idea stage has two sub-steps Story and Style',/^Story.*\|Style/.test(subs),subs);
await p.locator('#v3stage .v3-sb').nth(1).click();await p.waitForTimeout(500);T('Style sub-step opens the Style page',await p.evaluate(()=>/feel|style|tone/i.test(document.querySelector('#stepPanel h2').textContent)),await p.evaluate(()=>document.querySelector('#stepPanel h2').textContent));
T('Style stays inside the Idea stage',await p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b').textContent==='Idea'));
// tools proxies
await p.locator('#v3rail .v3-tab').nth(2).click();await p.waitForTimeout(500);
await p.locator('#v3stage .v3-tools .btn').first().click();await p.waitForTimeout(700);T('Structure tool opens the cards board',await p.evaluate(()=>!document.getElementById('board').hidden));
T('rail still clickable above the board',await p.evaluate(()=>{const r=document.querySelector('#v3rail .v3-tab').getBoundingClientRect();return !!document.elementFromPoint(r.left+10,r.top+10).closest('#v3rail')}));
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(800);T('clicking another stage closes the board and navigates',await p.evaluate(()=>document.getElementById('board').hidden&&document.querySelector('#v3rail [aria-current=step] b').textContent==='Dialogue'));
await p.locator('#v3rail .v3-tab').nth(5).click();await p.waitForTimeout(600);await p.locator('#v3stage .v3-tools .btn').first().click();await p.waitForTimeout(700);T('Shots tool opens the shot board sheet',await p.evaluate(()=>!document.getElementById('sheet').hidden&&/Shot board/.test(document.querySelector('#sheet h2').textContent)));
await p.keyboard.press('Escape');await p.waitForTimeout(500);
// review proxies
await p.locator('#v3rail .v3-tab').nth(6).click();await p.waitForTimeout(600);
const open=async(label,test)=>{await p.locator('#stepPanel .v3-card button',{hasText:label}).first().click();await p.waitForTimeout(700);const ok=await p.evaluate(test);T('Review → '+label,ok);await p.keyboard.press('Escape');await p.waitForTimeout(500);if(await p.evaluate(()=>!!document.querySelector('.modal,.askov')))await p.keyboard.press('Escape')};
await open('Open the full stats',()=>/Stats/.test(document.querySelector('#sheet h2').textContent));
await open('Export',()=>!document.getElementById('sheet').hidden);
await open('Draft history',()=>!document.getElementById('sheet').hidden||!!document.querySelector('.drawer:not([hidden])'));
await open('Share',()=>!document.getElementById('sheet').hidden||!!document.querySelector('.modal'));
await open('Connect AI',()=>!document.getElementById('sheet').hidden);
await open('AI usage',()=>/usage/i.test(document.querySelector('#sheet h2').textContent));
await open('Screenplay words',()=>/words/i.test(document.querySelector('#sheet h2').textContent)&&document.querySelectorAll('#sheet dt').length===14);
T('Review: stage list links jump to a stage',await (async()=>{await p.locator('#stepPanel .v3-lk').nth(1).click();await p.waitForTimeout(600);return p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b').textContent==='Characters')})());
// project types change labels
await p.evaluate(()=>document.getElementById('btnNew').click());await p.waitForTimeout(600);
const types=await p.evaluate(()=>[...document.querySelectorAll('.ld-card,.type-card')].map(c=>c.textContent.trim().slice(0,20)));res.push('INFO landing cards: '+types.slice(0,12).join(' | '));
console.log(res.join('\n'));console.log('ERRS',errs);await b.close()})();
