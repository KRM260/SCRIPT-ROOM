const open=require('./pre.js');
(async()=>{const {b,p,errs}=await open();const res=[];const T=(n,ok,x)=>res.push((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));
await p.evaluate(()=>document.getElementById('btnExport').click());await p.waitForTimeout(600);
const info=()=>p.evaluate(()=>{const l=document.querySelector('#sheet [role=tablist]');const t=[...l.querySelectorAll('[role=tab]')];return {n:t.length,tab:t.map(x=>x.getAttribute('tabindex')).join(','),sel:t.map(x=>x.getAttribute('aria-selected')).join(','),pressed:t.some(x=>x.hasAttribute('aria-pressed')),label:t.findIndex(x=>x.getAttribute('aria-selected')==='true'),focusLabel:document.activeElement&&document.activeElement.textContent.trim()}});
let i=await info();T('export tabs: one tab stop (roving tabindex)',/^0(,-1)+$/.test(i.tab),i.tab);
T('export tabs use aria-selected, not aria-pressed',i.sel==='true,false,false,false,false'.slice(0,i.sel.length)&&!i.pressed,i.sel);
// tab into list from the sheet start, then arrow
await p.locator('#sheet [role=tab]').first().focus();
await p.keyboard.press('ArrowRight');await p.waitForTimeout(400);
i=await info();T('ArrowRight selects the next tab',i.label===1,JSON.stringify(i));
T('focus stays on the tab list after the redraw',/Shot list/.test(i.focusLabel),i.focusLabel);
T('roving tabindex follows the selection',i.tab.split(',')[1]==='0',i.tab);
await p.keyboard.press('End');await p.waitForTimeout(400);i=await info();T('End goes to the last tab and keeps focus',i.label===i.n-1&&i.focusLabel.length>0,JSON.stringify(i));
await p.keyboard.press('Home');await p.waitForTimeout(400);i=await info();T('Home goes to the first tab',i.label===0&&/Script/.test(i.focusLabel),i.focusLabel);
// selected tab still looks selected
const bg=await p.evaluate(()=>getComputedStyle(document.querySelector('#sheet [role=tab][aria-selected=true]')).backgroundColor);
const bg2=await p.evaluate(()=>getComputedStyle(document.querySelector('#sheet [role=tab][aria-selected=false]')).backgroundColor);
T('selected tab has its own background',bg!==bg2,bg+' vs '+bg2);
// other tablists on the page
await p.keyboard.press('Escape');await p.waitForTimeout(200);
const other=await p.evaluate(()=>[...document.querySelectorAll('[role=tablist]')].map(l=>[...l.querySelectorAll('[role=tab]')].map(x=>x.getAttribute('tabindex')).join(',')));
res.push('INFO other tablists on this page: '+JSON.stringify(other));
console.log(res.join('\n'));console.log('errs',errs.filter(e=>!/Failed to load resource/.test(e)));await b.close()})();
