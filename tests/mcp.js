const open=require('./pre.js'),mock=require('./mock-mcp.js');
process.on('uncaughtException',e=>{console.log(globalThis.__res.join('\n'));console.log(e.stack.split('\n').slice(0,3).join('\n'));process.exit(1)});
(async()=>{const A=await mock({token:'sekret',needSession:true,page:true});const B=await mock({sse:true});const C=await mock({noCors:true});
const {b,p,errs}=await open();const res=globalThis.__res=[];const T=(n,ok,x)=>res.push((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));
const sheet=()=>p.locator('#sheet').innerText();
const ask=async(label)=>{await p.waitForSelector('.askov',{timeout:3000});const txt=await p.locator('.askbx p').innerText();await p.locator('.askov .btn.primary').click();await p.waitForTimeout(200);return txt};
await p.locator('#v3rail .v3-tab').nth(6).click();await p.waitForTimeout(500);
await p.getByRole('button',{name:'Connect tools'}).click();await p.waitForTimeout(300);
T('sheet explains what works and does not',/Streamable HTTP|reachable over HTTP/.test(await p.locator('#sheet').innerHTML())&&/stdio/.test(await p.locator('#sheet').innerHTML()));
// bad address
await p.fill('#mcp-name','Bad');await p.fill('#mcp-url','http://example.com/mcp');await p.getByRole('button',{name:'Add and connect'}).click();await p.waitForTimeout(300);
T('plain http to a remote host is refused',/must start with https/.test(await sheet()));
// wrong token
await p.fill('#mcp-name','Mock A');await p.fill('#mcp-url',A.url);await p.fill('#mcp-tok','wrong');await p.getByRole('button',{name:'Add and connect'}).click();await p.waitForTimeout(800);
T('wrong token: real 401 message shown',/status 401.*check the token/.test(await sheet()),(await sheet()).match(/The server answered[^\n]*/)?.[0]);
// right token (re-add)
await p.getByRole('button',{name:'Remove Mock A'}).click();await p.waitForTimeout(200);
await p.fill('#mcp-name','Mock A');await p.fill('#mcp-url',A.url);await p.fill('#mcp-tok','sekret');await p.getByRole('button',{name:'Add and connect'}).click();await p.waitForTimeout(900);
T('connected, 4 tools found (two pages of tools/list)',/4 tools found/.test(await sheet()),(await sheet()).match(/Connected[^\n]*/)?.[0]);
const sA=A.seen;const init=sA.filter(x=>x.method==='initialize').pop(),noti=sA.find(x=>x.method==='notifications/initialized'),tl=sA.filter(x=>x.method==='tools/list');
T('initialize sent with bearer token and no session yet',init&&init.auth==='Bearer sekret'&&init.sid==='');
T('initialized notification carries the session id and protocol version',noti&&noti.sid==='sess-123'&&noti.proto==='2025-06-18',JSON.stringify(noti));
T('tools/list paged (2 calls)',tl.length===2);
T('Accept header allows json and event-stream',/application\/json/.test(init.acc)&&/text\/event-stream/.test(init.acc));
T('token NOT stored when remember is off',JSON.parse(await p.evaluate(()=>localStorage.getItem('scriptroom.mcp'))).servers[0].token==='');
// scene_count with fountain fill
await p.selectOption('#mcp-tool','scene_count');await p.waitForTimeout(300);
await p.selectOption('#mcpf-script-fill','fountain');await p.waitForTimeout(100);
const v=await p.inputValue('#mcpf-script');T('fill from project puts the Fountain script in the field',/INT\./.test(v)&&v.length>200,v.length+' chars');
await p.getByRole('button',{name:'Send'}).click();const q=await ask();
T('confirmation names the host and what is sent',q.includes('127.0.0.1')&&/script as fountain text/i.test(q)&&/words/.test(q),q.replace(/\n/g,' | '));
await p.waitForTimeout(600);
T('result shown from the server',/scenes: 4/.test(await sheet()),(await sheet()).match(/scenes: \d+/)?.[0]);
const call=A.seen.filter(x=>x.method==='tools/call').pop();T('server really received the script text',call&&/INT\./.test(call.args.script)&&call.sid==='sess-123');
// cancel path sends nothing
const before=A.seen.length;await p.getByRole('button',{name:'Send'}).click();await p.waitForSelector('.askov');await p.locator('.askov .btn:not(.primary)').click();await p.waitForTimeout(300);
T('Cancel in the confirmation sends nothing',A.seen.length===before);
// echo
await p.selectOption('#mcp-tool','echo');await p.waitForTimeout(300);
await p.getByRole('button',{name:'Send'}).click();await p.waitForTimeout(300);
T('missing required field blocks the call',/"text" is required/.test(await sheet()));
await p.fill('#mcpf-text','hello');await p.fill('#mcpf-times','3');await p.check('#mcpf-loud');await p.selectOption('#mcpf-mode','b');await p.fill('#mcpf-extra','{"a":1}');
await p.getByRole('button',{name:'Send'}).click();await ask();await p.waitForTimeout(500);
const e=A.seen.filter(x=>x.method==='tools/call').pop();
T('typed, number, checkbox, enum and JSON fields arrive typed',JSON.stringify(e.args)===JSON.stringify({text:'hello',times:3,loud:true,mode:'b',extra:{a:1}}),JSON.stringify(e.args));
// bad json
await p.fill('#mcpf-extra','{oops');await p.getByRole('button',{name:'Send'}).click();await p.waitForTimeout(300);
T('invalid JSON is caught before sending',/not valid JSON/.test(await sheet()));
// boom
await p.selectOption('#mcp-tool','boom');await p.waitForTimeout(300);
T('destructive hint is shown',/can change or delete/.test(await sheet()));
await p.getByRole('button',{name:'Send'}).click();await ask();await p.waitForTimeout(500);
T('server error shown honestly',/boom happened/.test(await sheet())&&/-32000/.test(await sheet()));
// toscript -> import
await p.selectOption('#mcp-tool','toscript');await p.waitForTimeout(300);await p.getByRole('button',{name:'Send'}).click();await ask();await p.waitForTimeout(500);
T('script answer is displayed',/KITCHEN/.test(await sheet()));
await p.getByRole('button',{name:'Open in Import'}).click();await p.waitForTimeout(500);
T('Open in Import hands the text over and recognises a script',/This is already a script/.test(await sheet())&&/Answer from Mock A/.test(await sheet()));
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// SSE server
await p.getByRole('button',{name:'Connect tools'}).click().catch(async()=>{await p.locator('#v3rail .v3-tab').nth(6).click();await p.getByRole('button',{name:'Connect tools'}).click()});await p.waitForTimeout(300);
await p.fill('#mcp-name','Mock B');await p.fill('#mcp-url',B.url);await p.getByRole('button',{name:'Add and connect'}).click();await p.waitForTimeout(1200);
T('event-stream (SSE) server connects and lists tools',/4 tools found/.test(await sheet()),(await sheet()).match(/Connected[^\n]*|The server[^\n]*|Could not[^\n]*/)?.[0]);
await p.selectOption('#mcp-tool','toscript');await p.waitForTimeout(300);await p.getByRole('button',{name:'Send'}).click();await ask();await p.waitForTimeout(700);
T('SSE tools/call answer received (notification before it ignored)',/KITCHEN/.test(await sheet()));
// no CORS
await p.fill('#mcp-name','Mock C');await p.fill('#mcp-url',C.url);await p.getByRole('button',{name:'Add and connect'}).click();await p.waitForTimeout(1000);
T('server without CORS: clear explanation, nothing faked',/may not allow web pages to call it \(CORS\)/.test(await sheet())&&!/tools found/.test((await sheet()).split('Add a server')[0].split('Mock C')[1]||''));
// remember token
await p.fill('#mcp-name','Mock D');await p.fill('#mcp-url',A.url);await p.fill('#mcp-tok','sekret');await p.check('#mcp-rem');await p.getByRole('button',{name:'Add and connect'}).click();await p.waitForTimeout(900);
const saved=JSON.parse(await p.evaluate(()=>localStorage.getItem('scriptroom.mcp'))).servers.find(s=>s.name==='Mock D');
T('token stored only when asked',saved&&saved.token==='sekret'&&saved.remember===true);
// token never in project state / export
const inProj=await p.evaluate(()=>{let s='';for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k!=='scriptroom.mcp')s+=localStorage.getItem(k)}return s.includes('sekret')});
T('token is not in the saved project data',!inProj);
console.log(res.join('\n'));console.log('errs',errs.filter(e=>!/Failed to load resource|CORS|ERR_FAILED/.test(e)));
A.close();B.close();C.close();await b.close();process.exit(0)})();
