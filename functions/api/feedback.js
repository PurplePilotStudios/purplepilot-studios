const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const ready=env=>Boolean(env.FEEDBACK_DB && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY && env.FEEDBACK_ENABLED==='true');
const gameIds=new Set(['studio','type-your-power-weapon','christmas-obby','arcade-experience']);
const categories=new Set(['idea','bug','feedback']);
export async function onRequestGet({env}){
  if(!ready(env))return json({enabled:false});
  try{await env.FEEDBACK_DB.prepare('SELECT id FROM feedback LIMIT 1').all();return json({enabled:true,siteKey:env.TURNSTILE_SITE_KEY});}
  catch{return json({enabled:false});}
}
export async function onRequestPost({request,env}){
  if(!ready(env))return json({ok:false},503);
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
  const message=input.message.trim();
  if(message.length<10 || message.length>1000 || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(message) || /https?:\/\//i.test(message))return json({ok:false},400);
  try{
    const challenge=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:input.token})});
    const verified=await challenge.json();
    if(!verified.success || verified.hostname!==url.hostname || verified.action!=='feedback')return json({ok:false},403);
    await env.FEEDBACK_DB.prepare('INSERT INTO feedback (id, game, category, message) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(),input.game,input.category,message).run();
    return json({ok:true},201);
  }catch{return json({ok:false},503);}
}
