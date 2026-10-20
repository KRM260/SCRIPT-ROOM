const open=require('./pre.js');
(async()=>{const {b,p,errs}=await open();const res=[];const T=(n,ok,x)=>res.push((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));
const closeAsk=async()=>{if(await p.locator('.askov').count()){await p.locator('.askov .btn.primary').click();await p.waitForTimeout(300)}};
const isW=c=>c==='rgb(255, 255, 255)'||c==='rgba(0, 0, 0, 0)';
const pages=async()=>p.evaluate(()=>[...document.querySelectorAll('.pv-page')].map(pg=>({bg:getComputedStyle(pg).backgroundColor,lines:[...pg.querySelectorAll('.pv-l')].map(l=>l.textContent)})));
const openExportPreview=async()=>{await p.evaluate(()=>document.getElementById('btnExport').click());await p.waitForTimeout(500);
  const pv=p.getByRole('button',{name:/See the pages|Hide pages/});if(await pv.count()&&(await pv.first().textContent())==='See the pages')await pv.first().click();await p.waitForTimeout(500)};
const closeSheetX=async()=>{await p.keyboard.press('Escape');await p.waitForTimeout(300)};

// ---- make the script long enough for several pages: 30 extra dialogue blocks at the end of scene 3
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(600);
await p.locator('#stepPanel select').first().selectOption({index:2});await p.waitForTimeout(600);
{const last=p.locator('.spe .blk').last().locator('textarea.ed').last();await last.click();await last.press('End');
 for(let i=0;i<30;i++){await last.press('Enter');await p.waitForTimeout(40);const cur=p.locator('.spe .blk').last().locator('textarea.ed').last();await cur.type('Filler line '+(i+1)+' that is long enough to wrap onto a second line of dialogue on the page.');}
 await p.waitForTimeout(900)}
// --- baseline: before lock
await openExportPreview();let pg=await pages();
T('before lock: pages white, no stars',pg.length>0&&pg.every(x=>isW(x.bg)&&!x.lines.includes('*')),pg.length+' pages');
const nums0=pg.flatMap(x=>x.lines).filter(s=>/^\d+$/.test(s));
T('before lock: scene numbers off by default',nums0.length===0);
await closeSheetX();
// --- lock
await p.locator('#v3rail .v3-tab').nth(6).click();await p.waitForTimeout(500);
await p.getByRole('button',{name:'Open revisions'}).click();await p.waitForTimeout(300);
await p.getByRole('button',{name:'Lock the script'}).click();await closeAsk();await p.waitForTimeout(300);
T('lock: sheet shows Locked',/Locked on/.test(await p.locator('#sheet').innerText()));
await closeSheetX();
await openExportPreview();pg=await pages();
const nums1=pg.flatMap(x=>x.lines).filter(s=>/^\d+[A-Z]*$/.test(s));
T('after lock: scene numbers print, 2 per scene (left and right)',nums1.length===8&&['1','2','3','4'].every(n=>nums1.filter(x=>x===n).length===2),nums1.join(','));
T('after lock: pages still white, no stars',pg.every(x=>isW(x.bg)&&!x.lines.includes('*')));
await closeSheetX();
// --- start Blue
await p.evaluate(()=>document.getElementById('btnExport').click());await p.waitForTimeout(400);
await p.getByRole('button',{name:/Revisions and scene numbers \(locked\)/}).click();await p.waitForTimeout(300);
T('revisions sheet offers the Blue revision',await p.getByRole('button',{name:'Start the Blue revision'}).count()===1);
await p.getByRole('button',{name:'Start the Blue revision'}).click();await closeAsk();await p.waitForTimeout(300);
T('Blue started',/Blue revision in progress/.test(await p.locator('#sheet').innerText()));
await closeSheetX();
await openExportPreview();pg=await pages();
T('Blue started, nothing edited: pages still white, no stars',pg.every(x=>isW(x.bg)&&!x.lines.includes('*')));
await closeSheetX();
// --- edit a dialogue line in scene 3
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(600);
const info=await p.evaluate(()=>({n:document.querySelectorAll('.spe .blk .ed').length,sel:!!document.querySelector('#stepPanel select, #stepPanel .chips')}));

const ed=p.locator('.spe .blk').nth(1).locator('textarea.ed').last();
await ed.click();await ed.press('End');await ed.type(' (changed in blue)');await p.waitForTimeout(900);
await openExportPreview();pg=await pages();
const colored=pg.filter(x=>x.bg==='rgb(207, 227, 250)');
T('edit: at least one page turns blue (#CFE3FA)',colored.length>=1,JSON.stringify(pg.map(x=>x.bg)));
T('edit: not every page is blue (only pages with changes)',colored.length<pg.length,colored.length+'/'+pg.length);
const stars=pg.map(x=>x.lines.filter(l=>l==='*').length);
T('edit: stars only on blue pages',pg.every((x,i)=>x.bg==='rgb(207, 227, 250)'?stars[i]>=1:stars[i]===0),stars.join());
T('blue page has header "Blue Revision <date>"',colored.some(x=>x.lines.some(l=>/^Blue Revision \d+ \w+ \d{4}$/.test(l))));
T('changed text present',pg.some(x=>/changed in blue|in blue/.test(x.lines.join(' '))));
await closeSheetX();

// ---- exports
const fs=require('fs'),cp=require('child_process'),os=require('os'),path=require('path');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rv-'));
await p.evaluate(()=>document.getElementById('btnExport').click());await p.waitForTimeout(500);
async function dl(label){const [d]=await Promise.all([p.waitForEvent('download',{timeout:8000}),p.getByRole('button',{name:label}).click()]);const f=path.join(tmp,d.suggestedFilename());await d.saveAs(f);return f}
const pdf=await dl('Download PDF');fs.copyFileSync(pdf,'out.pdf');
const q=cp.spawnSync('qpdf',['--check',pdf]);T('PDF passes qpdf --check',q.status===0||q.status===3,(q.stdout+q.stderr).toString().split('\n').slice(0,3).join(' ').slice(0,200));
const txt=cp.spawnSync('pdftotext',['-layout',pdf,'-']).stdout.toString();
T('PDF text: Blue Revision header',/Blue Revision \d+ \w+ \d{4}/.test(txt));
T('PDF text: scene numbers 1..4',[1,2,3,4].every(n=>new RegExp('(^|\\s)'+n+'\\s').test(txt)));
T('PDF text: margin stars',/\*/.test(txt));
const qdf=cp.spawnSync('qpdf',['--qdf','--object-streams=disable',pdf,path.join(tmp,'q.pdf')]);
const raw=fs.readFileSync(path.join(tmp,'q.pdf'),'latin1');
T('PDF: blue fill rectangle on exactly the blue pages',(raw.match(/0\.812 0\.890 0\.980 rg/g)||[]).length===colored.length,(raw.match(/0\.812 0\.890 0\.980 rg/g)||[]).length+' fills');
const html=await dl('Print-ready page (.html)');const H=fs.readFileSync(html,'utf8');
T('print HTML: blue background on one page',(H.match(/background:#CFE3FA/g)||[]).length===1);
T('print HTML: forces colour printing',/print-color-adjust:exact/.test(H));
T('print HTML: stars',(H.match(/>\*</g)||[]).length>=1);
const zipf=await dl(/Final Draft \+ Fountain/);
const ex=path.join(tmp,'z');fs.mkdirSync(ex);cp.spawnSync('unzip',['-o',zipf,'-d',ex]);
const files=fs.readdirSync(ex);res.push('INFO zip: '+files.join(','));
const fdx=files.find(f=>/\.fdx$/.test(f)),fo=files.find(f=>/\.fountain$/.test(f));
const X=fs.readFileSync(path.join(ex,fdx),'utf8'),F=fs.readFileSync(path.join(ex,fo),'utf8');
T('FDX: Scene Heading paragraphs carry Number 1..4',[1,2,3,4].every(n=>X.includes('Number="'+n+'" Type="Scene Heading"')));
T('Fountain: headings end with #n#',[1,2,3,4].every(n=>new RegExp('#'+n+'#').test(F)),(F.match(/#[0-9A-Z]+#/g)||[]).join(','));

// ---- second round: Pink, edit scene 4, blue page must stay blue
await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.evaluate(()=>document.getElementById('btnExport').click());await p.waitForTimeout(400);
await p.getByRole('button',{name:/Revisions and scene numbers \(locked\)/}).click();await p.waitForTimeout(300);
T('sheet lists the Blue round with its changed block count',/Blue revision, started .*changed block/.test(await p.locator('#sheet').innerText()));
await p.getByRole('button',{name:'Start the Pink revision'}).click();await closeAsk();await p.waitForTimeout(300);
await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.locator('#v3rail .v3-tab').nth(3).click();await p.waitForTimeout(600);
await p.locator('#stepPanel select').first().selectOption({index:2});await p.waitForTimeout(600);
const eds=p.locator('.spe .blk').last().locator('textarea.ed').last();
await eds.click();await eds.press('End');await eds.type(' (pink edit)');await p.waitForTimeout(900);
await openExportPreview();let pg2=await pages();
res.push('INFO pages after pink: '+JSON.stringify(pg2.map(x=>x.bg)));
T('pink page exists (#F7D3DF)',pg2.some(x=>x.bg==='rgb(247, 211, 223)'));
T('earlier blue page is still blue',pg2.some(x=>x.bg==='rgb(207, 227, 250)'));
T('pink page header says Pink Revision',pg2.some(x=>x.bg==='rgb(247, 211, 223)'&&x.lines.some(l=>/^Pink Revision /.test(l))));
T('blue page header still says Blue Revision',pg2.some(x=>x.bg==='rgb(207, 227, 250)'&&x.lines.some(l=>/^Blue Revision /.test(l))));
T('stars only on pink pages now (current round only)',pg2.every(x=>x.bg==='rgb(247, 211, 223)'?x.lines.includes('*'):!x.lines.includes('*')),pg2.map(x=>x.lines.filter(l=>l==='*').length).join());
T('pink edit visible',pg2.some(x=>/pink/.test(x.lines.join(' '))));
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// reload: state persists
await p.reload();await p.waitForTimeout(900);
await openExportPreview();let pg3=await pages();
T('after reload the colours and numbers persist',JSON.stringify(pg3.map(x=>x.bg))===JSON.stringify(pg2.map(x=>x.bg)),JSON.stringify(pg3.map(x=>x.bg)));
// unlock
await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.evaluate(()=>document.getElementById('btnExport').click());await p.waitForTimeout(400);
await p.getByRole('button',{name:/Revisions and scene numbers \(locked\)/}).click();await p.waitForTimeout(300);
await p.getByRole('button',{name:'Unlock'}).click();await closeAsk();await p.waitForTimeout(300);
T('unlock returns to the not-locked state',/not locked/.test(await p.locator('#sheet').innerText()));
await p.keyboard.press('Escape');await p.waitForTimeout(300);
await openExportPreview();let pg4=await pages();
T('after unlock pages are white again with no stars or numbers',pg4.every(x=>isW(x.bg)&&!x.lines.includes('*'))&&!pg4.flatMap(x=>x.lines).some(s=>/^\d+$/.test(s)));
console.log(JSON.stringify(pg.map(x=>x.bg)));
console.log(res.join('\n'));console.log('errs',errs.filter(e=>!/Failed to load resource/.test(e)));await b.close()})();
