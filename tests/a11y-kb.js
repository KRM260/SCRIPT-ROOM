// Keyboard-only checks. Prints PASS/FAIL lines.
const { chromium } = require('playwright');
(async()=>{const L=process.env.LANG2||'en';
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'${L}',landed:true,langChosen:true}));`);
await p.goto('file://'+process.env.SR_FILE);await p.waitForTimeout(900);
await p.evaluate(()=>document.getElementById('btnExample').click());await p.waitForTimeout(1100);if(await p.locator('.askov').count())await p.locator('.askov .btn.primary').click();await p.waitForTimeout(500);
const res=[];const T=(n,ok,x)=>{res.push((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
const ae=()=>p.evaluate(()=>{const a=document.activeElement;return a?{tag:a.tagName,id:a.id,cls:String(a.className).slice(0,30),txt:(a.textContent||'').trim().slice(0,30),inRail:!!a.closest('#v3rail'),inMain:!!a.closest('#stepPanel'),inDlg:!!a.closest('[role=dialog]')}:null});
// 1 skip link first stop
await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();window.scrollTo(0,0)});await p.keyboard.press('Tab');
let a=await ae();T('first Tab stop is the skip link',/skip/i.test(a.txt)||a.cls.includes('skip'),JSON.stringify(a));
await p.keyboard.press('Enter');await p.waitForTimeout(200);a=await ae();T('skip link moves focus into the page',a.id==='stepPanel',JSON.stringify(a));
// 2 every tab stop in first 60 has visible focus indicator
await p.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0)});
let bad=[],stops=0;
for(let i=0;i<70;i++){await p.keyboard.press('Tab');const r=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);const ow=parseFloat(cs.outlineWidth)||0;const vis=ow>=2&&cs.outlineStyle!=='none';const r=e.getBoundingClientRect();const inView=r.bottom>0&&r.top<innerHeight;return {d:e.tagName+'#'+e.id+'.'+String(e.className).slice(0,20)+' '+(e.textContent||'').trim().slice(0,20),vis,inView}});if(!r)continue;stops++;if(!r.vis)bad.push(r.d);}
T('focus ring visible on first '+stops+' tab stops',bad.length===0,bad.slice(0,5).join(' | '));
// 3 stage rail: Tab reaches rail, Enter activates, focus goes to heading
await p.evaluate(()=>{document.querySelectorAll('#v3rail .v3-tab')[1].focus()});await p.keyboard.press('Enter');await p.waitForTimeout(700);
a=await ae();const hd=await p.evaluate(()=>document.querySelector('#stepPanel h2')&&document.querySelector('#stepPanel h2').textContent);
T('rail Enter moves focus to the new page heading',a.tag==='H2',JSON.stringify(a)+' h2='+hd);
const live=await p.evaluate(()=>document.getElementById('v3live').textContent);T('live region announces stage',/Stage 2 of 7/.test(live)||L!=='en',live);
T('aria-current on the active stage',await p.evaluate(()=>document.querySelectorAll('#v3rail [aria-current=step]').length===1));
// 4 dialogs: sheet open via keyboard, trap, Escape, focus return
await p.evaluate(()=>document.getElementById('btnAI').focus());await p.keyboard.press('Enter');await p.waitForTimeout(700);
a=await ae();T('AI sheet: focus moved inside',a.inDlg,JSON.stringify(a));
let esc=false;for(let i=0;i<60;i++){await p.keyboard.press('Tab');const o=await p.evaluate(()=>!!document.activeElement.closest('#sheet'));if(!o){esc=true;break}}T('AI sheet: Tab cannot leave the dialog',!esc);
await p.keyboard.press('Escape');await p.waitForTimeout(600);
a=await ae();T('AI sheet: Escape closes and returns focus to the opener',a.id==='btnAI',JSON.stringify(a));
// 5 command palette
await p.keyboard.press('Control+k');await p.waitForTimeout(400);a=await ae();T('palette opens with focus in input',a.id==='palIn',JSON.stringify(a));
await p.keyboard.press('Escape');await p.waitForTimeout(300);a=await ae();T('palette Escape returns focus',a.tag!=='BODY',JSON.stringify(a));
// 6 tab list arrows in character card tabs (if any)
await p.evaluate(()=>document.querySelectorAll('#v3rail .v3-tab')[1].click());await p.waitForTimeout(700);
await p.evaluate(()=>{const h=document.querySelector('#stepPanel .acc-h');h&&h.click()});await p.waitForTimeout(500);
const hasTabs=await p.evaluate(()=>!!document.querySelector('[role=tablist] [role=tab]'));
if(hasTabs){await p.evaluate(()=>document.querySelector('[role=tablist] [role=tab]').focus());const before=await p.evaluate(()=>document.activeElement.textContent);await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);const after=await p.evaluate(()=>document.activeElement.textContent);T('arrow keys move between tabs',before!==after,before+' → '+after)}else T('tablist present on cast step',false,'no tablist (skipped)');
// 7 cards board
await p.evaluate(()=>document.querySelectorAll('#v3rail .v3-tab')[2].click());await p.waitForTimeout(600);
await p.evaluate(()=>document.getElementById('btnBoard').click());await p.waitForTimeout(800);a=await ae();T('cards board: focus moves into the board',await p.evaluate(()=>!!document.activeElement.closest('#board')),JSON.stringify(a));
const railVis=await p.evaluate(()=>{const r=document.getElementById('v3rail').getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!el.closest('#v3rail')});T('cards board: stage rail stays usable above it',railVis);
const kbMove=await p.evaluate(()=>[...document.querySelectorAll('#board button,#board [role=button]')].map(x=>(x.getAttribute('aria-label')||x.textContent||'').toLowerCase()).filter(x=>/move|up|down|earlier|later|reorder/.test(x)).length);T('cards board: keyboard way to reorder (buttons)',kbMove>0,kbMove+' controls');
await p.keyboard.press('Escape');await p.waitForTimeout(500);
console.log(res.join('\n'));console.log('ERRS',errs);await b.close()})();
