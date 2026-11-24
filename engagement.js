(() => {
  'use strict';
  const cfg = window.PURPLEPILOT_CONFIG;
  if (!cfg) return;
  const byId = id => document.getElementById(id);
  const make = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  };
  const games = new Map(cfg.games.map(g => [g.id, g]));
  const videoInfo = raw => {
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:') return null;
      const parts = u.pathname.split('/').filter(Boolean);
      let id = '', short = false;
      if (u.hostname === 'youtu.be') id = parts[0];
      else if (['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)) {
        if (u.pathname === '/watch') id = u.searchParams.get('v');
        else if (['shorts','embed','live'].includes(parts[0])) { id = parts[1]; short = parts[0] === 'shorts'; }
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? { id, short, url: 'https://www.youtube.com/watch?v=' + id } : null;
    } catch { return null; }
  };
  const clips = (Array.isArray(cfg.clips) ? cfg.clips : []).map(c => ({...c, video:videoInfo(c.url)})).filter(c => c.video && games.has(c.gameId) && typeof c.title === 'string');
  const filters = byId('clip-filters'), grid = byId('clip-grid'), empty = byId('clip-empty');
  let selected = 'all';
  const renderClips = () => {
    grid.replaceChildren();
    for (const clip of clips.filter(c => selected === 'all' || c.gameId === selected)) {
      const card = make('article','clip-card');
      const frame = make('div','clip-frame' + (clip.video.short ? ' short' : ''));
      const play = make('button','clip-play','▶ Load video');
      play.type = 'button';
      play.setAttribute('aria-label','Load YouTube video: '+clip.title);
      play.addEventListener('click', () => {
        const iframe = make('iframe');
        iframe.title = clip.title;
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + clip.video.id + '?autoplay=1&playsinline=1';
        iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen; autoplay';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.replaceChildren(iframe);
      });
      frame.append(play);
      const details = make('div','clip-details');
      const link = make('a','text-link','Watch on YouTube ↗');
      link.href = clip.video.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      details.append(make('small','',games.get(clip.gameId).name),make('h3','',clip.title),link);
      card.append(frame,details); grid.append(card);
    }
    empty.hidden = clips.length > 0;
    for (const b of filters.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.filter === selected));
  };
  if (clips.length) {
    filters.hidden = false;
    for (const [id,label] of [['all','All clips'], ...[...games].filter(([id])=>clips.some(c=>c.gameId===id)).map(([id,g])=>[id,g.name])]) {
      const b=make('button','clip-filter',label); b.type='button'; b.dataset.filter=id;
      b.addEventListener('click',()=>{selected=id;renderClips()}); filters.append(b);
    }
  }
  renderClips();
  const form=byId('feedback-form'), status=byId('feedback-status'), opener=byId('feedback-open'), submit=byId('feedback-submit'), gameSelect=byId('feedback-game');
  const ageForm=byId('feedback-age-form'), ageInput=byId('feedback-age'), ageContinue=byId('feedback-age-continue');
  for (const [id,g] of games) {const option=make('option','',g.name);option.value=id;gameSelect.append(option);}
  let token='', widget=null, starting=false;
  let siteKey='', eligibleAge=null, ageDenied=false;
  const ageDenialKey='purplepilot.feedback-age-denied';
  try {
    ageDenied=window.sessionStorage.getItem(ageDenialKey)==='1';
  } catch {
    // The check still works when browser storage is unavailable.
  }
  const showAgeDenial=()=>{
    ageForm.hidden=true;
    opener.hidden=true;
    status.textContent='Feedback is unavailable for this visit.';
    status.focus();
  };
  const loadTurnstile=()=>new Promise((resolve,reject)=>{
    if(window.turnstile){resolve();return;}
    const script=make('script'); script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload=()=>window.turnstile ? resolve() : reject(Error('Challenge unavailable'));
    script.onerror=()=>{script.remove();reject(Error('Challenge unavailable'));}; document.head.append(script);
  });
  const setToken=value=>{token=value;submit.disabled=!token;};
  const openForm=async()=>{
    if(starting || !ageForm.hidden || !form.hidden)return;
    if(ageDenied){
      showAgeDenial();
      return;
    }
    starting=true;opener.disabled=true;status.textContent='Checking feedback availability…';
    try {
      const response=await fetch('/api/feedback',{cache:'no-store'});
      const data=await response.json();
      if(!response.ok||!data.enabled||!data.siteKey)throw Error('not configured');
      siteKey=data.siteKey;
      ageForm.hidden=false;
      opener.hidden=true;
      status.textContent='';
      ageInput.focus();
    }catch{status.textContent='Online feedback is not open yet. Please check back later.';}
    finally{starting=false;opener.disabled=false;}
  };
  opener.addEventListener('click',openForm);
  ageForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(ageForm.hidden || starting || ageDenied)return;
    const age=ageInput.valueAsNumber;
    if(!Number.isInteger(age) || age<0 || age>130){
      status.textContent='Enter your age in whole years.';
      return;
    }
    if(age<13){
      ageDenied=true;
      ageInput.value='';
      try {
        window.sessionStorage.setItem(ageDenialKey,'1');
      } catch {
        // The current page still keeps feedback closed for this answer.
      }
      showAgeDenial();
      return;
    }
    starting=true;
    ageContinue.disabled=true;
    status.textContent='Opening feedback…';
    try {
      await loadTurnstile();
      form.hidden=false;
      widget=window.turnstile.render('#feedback-challenge',{sitekey:siteKey,action:'feedback',callback:setToken,'expired-callback':()=>setToken(''),'error-callback':()=>{setToken('');status.textContent='Verification could not complete. Try again.';}});
      eligibleAge=age;
      ageInput.value='';
      ageForm.hidden=true;
      status.textContent='';
      gameSelect.focus();
    } catch {
      form.hidden=true;
      status.textContent='Verification could not load. Try again.';
    } finally {
      starting=false;
      ageContinue.disabled=false;
    }
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault(); if(eligibleAge===null || !token || submit.disabled)return;
    submit.disabled=true;status.textContent='Sending feedback…';
    try{
      const payload={game:gameSelect.value,category:byId('feedback-kind').value,message:byId('feedback-message').value.trim(),age:eligibleAge,token};
      const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok||!result.ok)throw Error('submission failed');
      form.reset();status.textContent='Thank you! Your feedback was received.';
    }catch{status.textContent='Feedback could not be sent. Your message is still here; please try again.';}
    finally{setToken('');if(widget!==null)window.turnstile.reset(widget);}
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.feedbackGame && games.has(button.dataset.feedbackGame)){
      gameSelect.value=button.dataset.feedbackGame;
      byId('feedback').scrollIntoView({behavior:'auto'});await openForm();
    }
    if(button.dataset.shareGame && games.has(button.dataset.shareGame)){
      const game=games.get(button.dataset.shareGame);
      const url=new URL(location.href);url.hash='game-'+game.id;
      try{
        if(navigator.share)await navigator.share({title:game.name,url:url.href});
        else if(navigator.clipboard){await navigator.clipboard.writeText(url.href);button.textContent='Link copied';setTimeout(()=>{button.textContent='Share game';},2000);}
        else window.prompt('Copy game link:',url.href);
      }catch(error){if(error.name!=='AbortError')window.prompt('Copy game link:',url.href);}
    }
  });
})();
