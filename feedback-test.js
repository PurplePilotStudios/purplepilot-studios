(() => {
  'use strict';
  const get=id=>document.getElementById(id);
  const form=get('unlock-test'), keyField=get('setup-key'), status=get('test-status'), controls=get('test-controls'), send=get('send-test');
  let key='',token='',widget=null,busy=false;
  const headers=()=>({'X-PurplePilot-Test-Key':key});
  const load=()=>new Promise((resolve,reject)=>{
    if(window.turnstile)return resolve();
    const s=document.createElement('script');
    s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.onload=()=>window.turnstile?resolve():reject(new Error('Unavailable'));
    s.onerror=()=>{s.remove();reject(new Error('Unavailable'));};
    document.head.append(s);
  });
  const setToken=t=>{token=t;send.disabled=!t||busy;};
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;busy=true;
    key=keyField.value.trim();keyField.value='';
    const button=form.querySelector('button');button.disabled=true;
    status.textContent='Checking database and test configuration…';
    try{
      const r=await fetch('/api/feedback',{headers:headers(),cache:'no-store'});
      const d=await r.json();
      if(!r.ok||!d.enabled||!d.testMode||!d.siteKey)throw new Error('Configuration unavailable');
      await load();controls.hidden=false;
      widget=window.turnstile.render('#test-challenge',{sitekey:d.siteKey,action:'feedback',callback:setToken,'expired-callback':()=>setToken(''),'error-callback':()=>{setToken('');status.textContent='Turnstile verification failed. Reload to retry.';}});
      form.hidden=true;status.textContent='Database table reachable. Complete the verification, then send the test report.';
    }catch{key='';controls.hidden=true;status.textContent='Test unavailable. Check the setup key, production settings, database schema and latest deployment.';}
    finally{busy=false;button.disabled=false;send.disabled=!token;}
  });
  send.addEventListener('click',async()=>{
    if(busy||!token||!key)return;busy=true;send.disabled=true;
    status.textContent='Verifying and writing synthetic record…';
    try{
      const r=await fetch('/api/feedback',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({game:'studio',category:'feedback',message:'PurplePilot setup test: synthetic report.',token})});
      const d=await r.json();if(r.status!==201||!d.ok||!d.testMode)throw new Error('Test failed');
      status.textContent='Success: Turnstile verified, and the synthetic record was written to and read back from D1. Public feedback remains disabled.';
      key='';token='';controls.hidden=true;
    }catch{status.textContent='Test failed. Check the widget hostname and Cloudflare settings, then retry.';}
    finally{busy=false;setToken('');if(widget!==null&&!controls.hidden)window.turnstile.reset(widget);}
  });
})();
