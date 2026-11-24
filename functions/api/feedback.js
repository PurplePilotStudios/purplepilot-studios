const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const configured=env=>Boolean(env.FEEDBACK_DB && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
const ready=env=>configured(env) && env.FEEDBACK_ENABLED==='true';
// Restricted setup mode, never available while public feedback is enabled.
// Use a separate high-entropy secret, never the Turnstile secret.
async function testAuthorized(request,env){
  if(!configured(env) || env.FEEDBACK_ENABLED!=='false') return false;
  const expected=env.FEEDBACK_TEST_KEY, supplied=request.headers.get('X-PurplePilot-Test-Key');
  if(typeof expected!=='string' || expected.length<32 || expected.length>256 || !supplied || supplied.length>256) return false;
  const enc=new TextEncoder();
  const [a,b]=await Promise.all([expected,supplied].map(s=>crypto.subtle.digest('SHA-256',enc.encode(s))));
  const aa=new Uint8Array(a),bb=new Uint8Array(b);let diff=0;
  for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];
  return diff===0;
}
const gameIds=new Set(['studio','type-your-power-weapon','christmas-obby','arcade-experience']);
const categories=new Set(['idea','bug','feedback']);
export async function onRequestGet({request,env}){
  const testing=await testAuthorized(request,env);
  if(!ready(env) && !testing)return json({enabled:false});
  try{await env.FEEDBACK_DB.prepare('SELECT id FROM feedback LIMIT 1').all();return json({enabled:true,siteKey:env.TURNSTILE_SITE_KEY,testMode:testing});}
  catch{return json({enabled:false});}
}
export async function onRequestPost({request,env}){
  const testing=await testAuthorized(request,env);
  if(!ready(env) && !testing)return json({ok:false},503);
  const url=new URL(request.url);
  if(request.headers.get('Origin')!==url.origin || !request.headers.get('Content-Type')?.startsWith('application/json'))return json({ok:false},403);
  let input;
  try{
    const reader=request.body?.getReader();if(!reader)return json({ok:false},400);
    let size=0;const chunks=[];
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>10000){await reader.cancel();return json({ok:false},413);}chunks.push(value);}
    const data=new Uint8Array(size);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}
    input=JSON.parse(new TextDecoder().decode(data));
  }catch{return json({ok:false},400);}
  if(!input || !gameIds.has(input.game) || !categories.has(input.category) || typeof input.message!=='string' || typeof input.token!=='string' || !input.token || input.token.length>2048)return json({ok:false},400);
  if(!testing && (!Number.isInteger(input.age) || input.age<13 || input.age>130))return json({ok:false},403);
  const message=input.message.trim();
  if(testing && (input.game!=='studio' || input.category!=='feedback' || message!=='PurplePilot setup test: synthetic report.'))return json({ok:false},400);
  if(message.length<10 || message.length>1000 || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(message) || /https?:\/\//i.test(message))return json({ok:false},400);
  try{
    const challenge=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:input.token})});
    const verified=await challenge.json();
    if(!verified.success || verified.hostname!==url.hostname || verified.action!=='feedback')return json({ok:false},403);
    if(testing){
      // Only a single fixed synthetic test record can be written in this mode.
      const id='purplepilot-setup-test';
      await env.FEEDBACK_DB.prepare('INSERT OR REPLACE INTO feedback (id, game, category, message) VALUES (?, ?, ?, ?)').bind(id,input.game,input.category,message).run();
      const stored=await env.FEEDBACK_DB.prepare('SELECT id FROM feedback WHERE id = ?').bind(id).first();
      if(stored?.id!==id)return json({ok:false},503);
      return json({ok:true,testMode:true},201);
    }
    await env.FEEDBACK_DB.prepare('INSERT INTO feedback (id, game, category, message) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(),input.game,input.category,message).run();
    return json({ok:true},201);
  }catch{return json({ok:false},503);}
}
