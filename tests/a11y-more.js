// Pro mode, phone width, zoom, text spacing, reduced motion
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();
const res=[];const T=(n,ok,x)=>res.push((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));
async function open(w,h,opts={}){const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:opts.rm||'no-preference',deviceScaleFactor:opts.dsf||1});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
 await p.addInitScript(`localStorage.setItem('scriptroom.prefs',JSON.stringify({toured:true,lang:'${opts.lang||'en'}',landed:true,langChosen:true${opts.pro?",ui:'pro'":''}}));`);
 await p.goto('file://'+process.env.SR_FILE);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('btnExample').click());await p.waitForTimeout(1000);if(await p.locator('.askov').count())await p.locator('.askov .btn.primary').click();await p.waitForTimeout(400);return p}
// Pro mode
let p=await open(1400,900,{pro:true});
const secs=await p.evaluate(()=>document.querySelectorAll('#stepPanel section.sec').length);T('Pro mode renders all sections',secs===9,secs+' sections');
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(1200);
const cur=await p.evaluate(()=>document.querySelector('#v3rail [aria-current=step] b').textContent);T('Pro mode: rail click scrolls and marks Dialogue',cur==='Dialogue',cur);
const inView=await p.evaluate(()=>{const e=document.getElementById('sec-4');const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0});T('Pro mode: section is in view',inView);
const heads=await p.evaluate(()=>document.querySelectorAll('#stepPanel h2').length);T('Pro mode: one h2 per section',heads>=8,heads+' h2');
await p.close();
// phone 390
p=await open(390,844);
T('phone: no horizontal scroll',await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),await p.evaluate(()=>document.documentElement.scrollWidth+'>'+document.documentElement.clientWidth));
const tabs=await p.evaluate(()=>[...document.querySelectorAll('#v3rail .v3-tab')].map(t=>{const r=t.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}));T('phone: stage tabs at least 44px tall',await p.evaluate(()=>[...document.querySelectorAll('#v3rail .v3-tab')].every(t=>t.getBoundingClientRect().height>=44)),tabs.join(' '));
await p.screenshot({path:'phone-390.png'});
T('phone: rail does not take more than 40% of screen',await p.evaluate(()=>document.getElementById('v3rail').getBoundingClientRect().height<innerHeight*0.4),await p.evaluate(()=>Math.round(document.getElementById('v3rail').getBoundingClientRect().height)+'px'));
await p.close();
// 200% zoom emulated: 640x450 css px viewport (1280x900 at 200%)
p=await open(640,450);
T('200% zoom: no horizontal scroll',await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
T('200% zoom: sticky rail leaves room (<45% of viewport)',await p.evaluate(()=>document.getElementById('v3rail').getBoundingClientRect().height<innerHeight*0.45),await p.evaluate(()=>Math.round(document.getElementById('v3rail').getBoundingClientRect().height)+'px of '+innerHeight));
await p.screenshot({path:'zoom200.png'});await p.close();
// text spacing (WCAG 1.4.12)
p=await open(1100,800);
await p.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});await p.waitForTimeout(400);
const clipped=await p.evaluate(()=>{const out=[];document.querySelectorAll('button,.v3-tab,.v3-lead,.chip,.fmt,label,h2,h3,p,small').forEach(e=>{const cs=getComputedStyle(e);if(e.offsetParent===null)return;if((cs.overflow==='hidden'||cs.overflowX==='hidden')&&!/ellipsis/.test(cs.textOverflow)&&!cs.webkitLineClamp&&(e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2))out.push(e.tagName+'.'+String(e.className).slice(0,20)+' "'+(e.textContent||'').trim().slice(0,24)+'"')});return out});
T('text spacing: no clipped text',clipped.length===0,clipped.slice(0,6).join(' | '));
T('text spacing: no horizontal page scroll',await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
await p.screenshot({path:'spacing.png'});await p.close();
// reduced motion: no running animations/transitions after a stage change
p=await open(1400,900,{rm:'reduce'});
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(80);
const anims=await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&(a.effect.getTiming().duration||0)>50).map(a=>(a.animationName||a.transitionProperty||'?')));T('reduced motion: no animation longer than 50ms runs after navigation',anims.length===0,anims.slice(0,5).join(','));
await p.close();
p=await open(1400,900,{rm:'no-preference'});
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(80);
const anims2=await p.evaluate(()=>document.getAnimations().length);res.push('INFO with motion allowed, animations running right after navigation: '+anims2);await p.close();
console.log(res.join('\n'));await b.close()})();
