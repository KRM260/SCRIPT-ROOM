// A small MCP server over Streamable HTTP, for testing the browser client. Two modes: json and sse. Not a real third-party server.
const http=require('http');
function make(opt){opt=opt||{};const seen=[];
const srv=http.createServer((req,res)=>{
  const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Accept','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Expose-Headers':'Mcp-Session-Id'};
  if(opt.noCors){delete cors['Access-Control-Allow-Origin']}
  if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end()}
  let b='';req.on('data',d=>b+=d);req.on('end',()=>{
    let m;try{m=JSON.parse(b)}catch(e){res.writeHead(400,cors);return res.end('bad json')}
    seen.push({method:m.method,auth:req.headers.authorization||'',sid:req.headers['mcp-session-id']||'',proto:req.headers['mcp-protocol-version']||'',args:m.params&&m.params.arguments,acc:req.headers.accept});
    if(opt.token&&req.headers.authorization!=='Bearer '+opt.token){res.writeHead(401,Object.assign({'Content-Type':'text/plain'},cors));return res.end('unauthorized');}
    const send=(obj,extra)=>{const h=Object.assign({},cors,extra||{});
      if(opt.sse){h['Content-Type']='text/event-stream';res.writeHead(200,h);res.write('event: message\ndata: {"jsonrpc":"2.0","method":"notifications/message","params":{"level":"info","data":"hi"}}\n\n');setTimeout(()=>{res.write('event: message\ndata: '+JSON.stringify(obj)+'\n\n');res.end()},30)}
      else{h['Content-Type']='application/json';res.writeHead(200,h);res.end(JSON.stringify(obj))}};
    if(m.method==='notifications/initialized'){res.writeHead(202,cors);return res.end()}
    if(m.method==='initialize')return send({jsonrpc:'2.0',id:m.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'Mock Screenplay Tools',version:'0.1'}}},{'Mcp-Session-Id':'sess-123'});
    if(opt.needSession&&req.headers['mcp-session-id']!=='sess-123'){res.writeHead(400,cors);return res.end('no session')}
    if(m.method==='tools/list'){
      const all=[{name:'scene_count',description:'Counts scene headings in a Fountain script.',inputSchema:{type:'object',properties:{script:{type:'string',description:'Fountain text'}},required:['script']}},
        {name:'echo',description:'Echoes back.',inputSchema:{type:'object',properties:{text:{type:'string'},times:{type:'integer'},loud:{type:'boolean'},mode:{type:'string',enum:['a','b']},extra:{type:'object'}},required:['text']}},
        {name:'boom',description:'Always fails.',annotations:{destructiveHint:true},inputSchema:{type:'object',properties:{}}},
        {name:'toscript',description:'Returns a tiny Fountain script.',inputSchema:{type:'object',properties:{}}}];
      if(opt.page){const cur=m.params&&m.params.cursor;return send({jsonrpc:'2.0',id:m.id,result:cur?{tools:all.slice(2)}:{tools:all.slice(0,2),nextCursor:'p2'}})}
      return send({jsonrpc:'2.0',id:m.id,result:{tools:all}})}
    if(m.method==='tools/call'){const n=m.params.name,a=m.params.arguments||{};
      if(n==='scene_count'){const c=(String(a.script).match(/^(INT\.|EXT\.)/gm)||[]).length;return send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:'scenes: '+c}]}})}
      if(n==='echo')return send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:JSON.stringify(a)}]}});
      if(n==='boom')return send({jsonrpc:'2.0',id:m.id,error:{code:-32000,message:'boom happened'}});
      if(n==='toscript')return send({jsonrpc:'2.0',id:m.id,result:{content:[{type:'text',text:'INT. KITCHEN - DAY\n\nMaya stirs a pot.\n\nMAYA\nIt needs salt.\n\nEXT. GARDEN - NIGHT\n\nRain.\n'}]}});
      return send({jsonrpc:'2.0',id:m.id,result:{isError:true,content:[{type:'text',text:'unknown tool'}]}})}
    res.writeHead(404,cors);res.end('?')})});
return new Promise(r=>srv.listen(0,'127.0.0.1',()=>r({url:'http://127.0.0.1:'+srv.address().port+'/mcp',seen,close:()=>srv.close()})))}
module.exports=make;
