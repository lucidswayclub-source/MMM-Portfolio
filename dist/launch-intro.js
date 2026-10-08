/** The camera separates into machined parts, then assembles into the MMM ident. */
(()=>{
 if(location.pathname.replace(/\/$/,'')!==''||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const intro=document.createElement('div');intro.className='launch-intro launch-lens';intro.setAttribute('role','dialog');intro.setAttribute('aria-modal','true');intro.setAttribute('aria-label','Camera components forming the MegMultiMedia logo');
 intro.innerHTML='<div class="launch-backdrop"></div><div class="launch-lens-path" aria-hidden="true"><span></span><span></span><span></span></div><div class="launch-camera-stage" aria-hidden="true"></div><div class="launch-identity" aria-hidden="true"><div class="launch-logo"><img class="launch-size-reference" alt=""><div class="launch-parts"><span><img alt=""></span><span><img alt=""></span><span><img alt=""></span></div></div></div><button type="button" class="launch-sound" aria-pressed="false" aria-label="Enable intro sound" disabled>Play with sound</button><button type="button" class="launch-skip">Skip intro <span aria-hidden="true">↗</span></button>';
 const previousFocus=document.activeElement,roots=[...document.querySelectorAll('header,main,footer,.skip')].map(el=>({el,inert:el.inert}));
 const soundButton=intro.querySelector('.launch-sound'),skip=intro.querySelector('.launch-skip'),stage=intro.querySelector('.launch-camera-stage');let done=false,model=null,raf=0,lastTime=0,time=0,fallback=false,sound=null;
 const finish=()=>{
  if(done)return;done=true;clearTimeout(failsafe);cancelAnimationFrame(raf);sound?.dispose();intro.classList.add('is-exiting');
  setTimeout(()=>{
   model?.dispose();intro.remove();document.documentElement.classList.remove('launch-active');for(const {el,inert}of roots)el.inert=inert;
   document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('resize',onResize);
   if(previousFocus&&previousFocus!==document.body&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});else{const main=document.querySelector('main');if(main){main.setAttribute('tabindex','-1');main.focus({preventScroll:true});}}
   dispatchEvent(new Event('mmm:launch-finished'));
  },650);
 };
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();finish()}if(e.key==='Tab'){e.preventDefault();const controls=[...intro.querySelectorAll('button:not(:disabled)')],index=controls.indexOf(document.activeElement);controls[(index+(e.shiftKey?-1:1)+controls.length)%controls.length].focus()}};
 const onResize=()=>{if(!model)return;model.resize();model.setLogoTargets(intro.querySelector('img'),intro.querySelector('.launch-identity').clientWidth);};
 const tick=now=>{
  raf=0;if(done||document.hidden)return;
  if(lastTime)time+=Math.min(50,now-lastTime)/1000;lastTime=now;
  sound?.update(time);
  const clamp=n=>Math.max(0,Math.min(1,n));
  if(fallback){
   const p=clamp((time-.15)/.75);intro.querySelectorAll('.launch-parts>span').forEach(part=>{part.style.opacity=String(p*p*(3-2*p));part.style.transform=`scale(${.94+p*.06})`;});
   if(time>=1.7){finish();return}raf=requestAnimationFrame(tick);return;
  }
  try{model.drawIntro(time)}catch(error){console.warn('MMM intro render fallback:',error);showFallback();return;}
  // The lens rings stretch toward the viewer, then draw inward as the pieces form the mark.
  intro.style.setProperty('--lens-approach',clamp(time/2.8));
  intro.style.setProperty('--lens-gather',clamp((time-2.1)/2.6));
  const fade=clamp((time-4.25)/.8),crossfade=fade*fade*(3-2*fade);stage.style.opacity=String(1-crossfade);
  const parts=intro.querySelectorAll('.launch-parts>span');
  parts.forEach((part,i)=>{const p=clamp((time-4.25)/.8),settle=p*p*(3-2*p);part.style.opacity=String(settle);part.style.transform='none';});
  if(time>=5.25){finish();return}raf=requestAnimationFrame(tick);
 };
 const showFallback=()=>{if(done)return;fallback=true;intro.classList.add('is-playing','is-fallback');stage.style.opacity='0';lastTime=0;time=0;if(!document.hidden&&!raf)raf=requestAnimationFrame(tick);};
 soundButton.addEventListener('click',async()=>{if(done||!sound)return;if(sound.enabled){sound.mute();soundButton.textContent='Play with sound';soundButton.setAttribute('aria-pressed','false');soundButton.setAttribute('aria-label','Enable intro sound');return;}soundButton.disabled=true;try{if(await sound.enable(0)){if(done){sound.dispose();return;}time=0;lastTime=0;clearTimeout(failsafe);failsafe=setTimeout(finish,8000);soundButton.textContent='Mute sound';soundButton.setAttribute('aria-pressed','true');soundButton.setAttribute('aria-label','Mute intro sound');}else{soundButton.textContent='Try sound again';} }catch{sound.mute();soundButton.textContent='Try sound again';}finally{soundButton.disabled=false;}});
 const onVisibility=()=>{if(document.hidden&&sound?.enabled){sound.mute();soundButton.textContent='Play with sound';soundButton.setAttribute('aria-pressed','false');soundButton.setAttribute('aria-label','Enable intro sound');}cancelAnimationFrame(raf);raf=0;lastTime=0;if(!document.hidden&&(model||fallback)&&!done)raf=requestAnimationFrame(tick)};
 skip.addEventListener('click',finish);document.documentElement.classList.add('launch-active');for(const {el}of roots)el.inert=true;
 document.body.append(intro);skip.focus({preventScroll:true});document.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onVisibility);window.addEventListener('resize',onResize);
 let failsafe=setTimeout(finish,10000);
 const imageReady=Promise.all([...intro.querySelectorAll('img')].map(image=>new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src='/assets/mmm-logo-transparent.png';if(image.complete&&image.naturalWidth)resolve();})));
 Promise.all([import('/travelling-camera.js?v=11'),imageReady,import('/intro-sound.js?v=2')]).then(([{TravellingCamera},_,{IntroSound}])=>{
  if(done)return;sound=new IntroSound();soundButton.disabled=!(window.AudioContext||window.webkitAudioContext);sound.enable(time,true).then(enabled=>{if(enabled&&!done){soundButton.textContent='Mute sound';soundButton.setAttribute('aria-pressed','true');soundButton.setAttribute('aria-label','Mute intro sound');}}).catch(()=>{});model=new TravellingCamera(()=>!done,stage);if(!model.gl){showFallback();return}model.resize();model.setLogoTargets(intro.querySelector('img'),intro.querySelector('.launch-identity').clientWidth);intro.classList.add('is-playing');if(!document.hidden)raf=requestAnimationFrame(tick);
 }).catch(error=>{console.warn('MMM intro fallback:',error);showFallback();});
})();
