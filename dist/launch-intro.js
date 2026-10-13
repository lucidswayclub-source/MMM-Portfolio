/** The camera separates into machined parts, then assembles into the MMM ident. */
(()=>{
 if(location.pathname.replace(/\/$/,'')!==''||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const intro=document.createElement('div');intro.className='launch-intro launch-lens';intro.setAttribute('role','dialog');intro.setAttribute('aria-modal','true');intro.setAttribute('aria-label','Camera components forming the MegMultiMedia logo');
 intro.innerHTML='<div class="launch-backdrop"></div><div class="launch-lens-path" aria-hidden="true"><span></span><span></span><span></span></div><div class="launch-camera-stage" aria-hidden="true"></div><div class="launch-identity" aria-hidden="true"><div class="launch-logo"><img class="launch-size-reference" alt=""><div class="launch-parts"><span><img alt=""></span><span><img alt=""></span><span><img alt=""></span></div></div></div><button type="button" class="launch-sound" aria-pressed="false" aria-label="Enable intro sound" disabled>Play with sound</button><button type="button" class="launch-skip">Skip intro <span aria-hidden="true">↗</span></button>';
 // Studio atmosphere stays behind the transparent camera and exact logo silhouette.
 const atmosphere=document.createElement('div');atmosphere.className='launch-atmosphere';atmosphere.setAttribute('aria-hidden','true');
 atmosphere.innerHTML='<div class="launch-studio-beam beam-blue"></div><div class="launch-studio-beam beam-mint"></div><div class="launch-studio-haze"></div><div class="launch-studio-floor"></div><div class="launch-studio-horizon"></div><div class="launch-studio-grain"></div>';
 for(let i=0;i<12;i++){
  const mote=document.createElement('span');mote.className='launch-studio-mote';
  mote.style.setProperty('--mote-x',`${8+(i*37)%84}%`);mote.style.setProperty('--mote-y',`${15+(i*23)%67}%`);
  mote.style.setProperty('--mote-travel',`${18+i%4*12}px`);mote.style.setProperty('--mote-opacity',String(.12+i%3*.09));
  atmosphere.append(mote);
 }
 const stageLight=document.createElement('div');stageLight.className='launch-stage-light';
 stageLight.innerHTML='<div class="launch-stage-halo"></div><div class="launch-stage-orbit orbit-a"></div><div class="launch-stage-orbit orbit-b"></div><div class="launch-stage-streak streak-a"></div><div class="launch-stage-streak streak-b"></div><div class="launch-stage-reflection"></div>';
 atmosphere.prepend(stageLight);
 intro.querySelector('.launch-backdrop').append(atmosphere);
 const previousFocus=document.activeElement,roots=[...document.querySelectorAll('header,main,footer,.skip')].map(el=>({el,inert:el.inert}));
 const soundButton=intro.querySelector('.launch-sound'),skip=intro.querySelector('.launch-skip'),stage=intro.querySelector('.launch-camera-stage');let done=false,model=null,raf=0,lastTime=0,time=0,fallback=false,sound=null,resizeTimer=0,lastSize='',revealFrame=0;
 // Seven overlapping iris blades expand past every viewport corner.
 const irisGeometry=(width,height,progress)=>{
  const radius=(Math.hypot(width/2,height/2)+48)/Math.cos(Math.PI/7)*progress;
  const angle=-Math.PI/2+(1-progress)*.16;
  const points=Array.from({length:7},(_,i)=>[width/2+Math.cos(angle+i*Math.PI*2/7)*radius,height/2+Math.sin(angle+i*Math.PI*2/7)*radius]);
  // Rounded blade tips follow one continuous contour instead of sharp polygon corners.
  const blend=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t);
  const format=point=>point.map(n=>n.toFixed(2)).join(' ');
  const incoming=points.map((point,i)=>blend(point,points[(i+6)%7],.13));
  const outgoing=points.map((point,i)=>blend(point,points[(i+1)%7],.13));
  const outline='M'+format(incoming[0])+points.map((point,i)=>`Q${format(point)} ${format(outgoing[i])}L${format(incoming[(i+1)%7])}`).join('')+'Z';
  const seams=points.map((point,i)=>{
   const a=angle+i*Math.PI*2/7+.65;
   return `M${point[0].toFixed(2)} ${point[1].toFixed(2)}l${(Math.cos(a)*Math.max(width,height)*1.6).toFixed(2)} ${(Math.sin(a)*Math.max(width,height)*1.6).toFixed(2)}`;
  }).join('');
  return {radius,outline,seams,clip:`path(evenodd, "M0 0H${width}V${height}H0Z${outline}")`};
 };
 const finish=(skipTransition=false)=>{
  if(done)return;done=true;clearTimeout(failsafe);clearTimeout(resizeTimer);cancelAnimationFrame(raf);
  const quick=skipTransition===true||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('motion-disabled');
  const duration=quick?220:1150;
  intro.classList.add('is-exiting');
  if(!quick){
   intro.classList.add('is-iris-reveal');document.documentElement.classList.add('launch-revealing');
   const started=performance.now();
   const mechanical=CSS.supports('clip-path','path(evenodd, "M0 0H1V1H0Z")');
   const aperture=document.createElement('div');aperture.className='launch-aperture-edge';aperture.setAttribute('aria-hidden','true');
   aperture.innerHTML='<span class="aperture-metal-grain"></span><svg preserveAspectRatio="none"><path class="aperture-blade-seams"/><path class="aperture-depth"/><path class="aperture-rim"/><path class="aperture-edge-patina"/></svg>';intro.append(aperture);
   const edgeSvg=aperture.querySelector('svg'),rim=aperture.querySelector('.aperture-rim'),seams=aperture.querySelector('.aperture-blade-seams'),patina=aperture.querySelector('.aperture-edge-patina'),depth=aperture.querySelector('.aperture-depth');
   const reveal=now=>{
    const p=Math.max(0,Math.min(1,(now-started)/duration));
    // Continuous lens movement without a long, almost stationary lead-in.
    const ease=(1-Math.cos(Math.PI*p))/2;
    const geometry=irisGeometry(innerWidth,innerHeight,ease);
    if(mechanical){intro.style.clipPath=geometry.clip;intro.style.webkitMaskImage='none';intro.style.maskImage='none';}
    intro.style.setProperty('--iris-radius',`${geometry.radius.toFixed(2)}px`);
    aperture.style.opacity=String(Math.sin(Math.PI*p)**2*.48);
    edgeSvg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);rim.setAttribute('d',geometry.outline);seams.setAttribute('d',geometry.seams);patina.setAttribute('d',geometry.outline);depth.setAttribute('d',geometry.outline);
    if(p<1)revealFrame=requestAnimationFrame(reveal);
   };
   revealFrame=requestAnimationFrame(reveal);
   const wall=document.querySelector('.hero-image-wall'),copy=document.querySelector('.hero-intro');
   wall?.animate([{scale:'1.055',offset:0},{scale:'1.012',offset:.68},{scale:'1',offset:1}],{duration:1400,easing:'cubic-bezier(.22,1,.36,1)'});
   copy?.animate([{opacity:.8,scale:'.99'},{opacity:1,scale:'1'}],{duration:1250,easing:'cubic-bezier(.22,1,.36,1)'});
  }else{intro.style.transitionDuration=duration+'ms';sound?.mute();}
  setTimeout(()=>{
   cancelAnimationFrame(revealFrame);sound?.dispose();model?.dispose();intro.remove();document.documentElement.classList.remove('launch-active','launch-revealing');for(const {el,inert}of roots)el.inert=inert;
   document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('resize',onResize);
   if(previousFocus&&previousFocus!==document.body&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});else{const main=document.querySelector('main');if(main){main.setAttribute('tabindex','-1');main.focus({preventScroll:true});}}
   dispatchEvent(new Event('mmm:launch-finished'));
  },duration+50);
 };
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();finish(true)}if(e.key==='Tab'){e.preventDefault();const controls=[...intro.querySelectorAll('button:not(:disabled)')],index=controls.indexOf(document.activeElement);controls[(index+(e.shiftKey?-1:1)+controls.length)%controls.length].focus()}};
 const onResize=()=>{
  clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
   if(done||!model?.gl)return;
   const box=model.el.getBoundingClientRect(),width=intro.querySelector('.launch-identity').clientWidth;
   const size=`${Math.round(box.width)}:${Math.round(box.height)}:${Math.round(width)}:${Math.min(2,devicePixelRatio||1)}`;
   if(size===lastSize)return;lastSize=size;
   model.resize();model.setLogoTargets(intro.querySelector('img'),width);model.drawIntro(time);
  },120);
 };
 const tick=now=>{
  raf=0;if(done||document.hidden)return;
  if(lastTime)time+=Math.min(50,now-lastTime)/1000;lastTime=now;
  sound?.update(time);
  const clamp=n=>Math.max(0,Math.min(1,n));
  const studioPhase=clamp(time/5.25);
  intro.style.setProperty('--studio-phase',studioPhase);
  intro.style.setProperty('--studio-energy',Math.sin(Math.PI*studioPhase));
  intro.style.setProperty('--studio-gather',clamp((time-3)/1.8));
  if(fallback){
   const p=clamp((time-.15)/.75);intro.querySelectorAll('.launch-parts>span').forEach(part=>{part.style.opacity=String(p*p*(3-2*p));part.style.transform=`scale(${.94+p*.06})`;});
   if(time>=1.7){finish();return}raf=requestAnimationFrame(tick);return;
  }
  try{if(!model?.gl||model.gl.isContextLost()){showFallback();return}model.drawIntro(time)}catch(error){console.warn('MMM intro render fallback:',error);showFallback();return;}
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
 skip.addEventListener('click',()=>finish(true));document.documentElement.classList.add('launch-active');for(const {el}of roots)el.inert=true;
 document.body.append(intro);document.documentElement.classList.remove('intro-boot');skip.focus({preventScroll:true});document.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onVisibility);window.addEventListener('resize',onResize);
 let failsafe=setTimeout(finish,10000);
 const imageReady=Promise.all([...intro.querySelectorAll('img')].map(async image=>{
  image.src='/assets/mmm-logo-transparent.png';
  if(image.decode)await image.decode();
  else await new Promise((resolve,reject)=>{if(image.complete&&image.naturalWidth){resolve();return}image.onload=resolve;image.onerror=reject;});
 }));
 // Audio readiness never holds up the visual intro.
 import('/intro-sound.js?v=2').then(({IntroSound})=>{
  if(done)return;sound=new IntroSound();soundButton.disabled=!(window.AudioContext||window.webkitAudioContext);
  sound.enable(time,true).then(enabled=>{if(enabled&&!done){soundButton.textContent='Mute sound';soundButton.setAttribute('aria-pressed','true');soundButton.setAttribute('aria-label','Mute intro sound');}}).catch(()=>{});
 }).catch(()=>{});
 Promise.all([import('/travelling-camera.js?v=14'),imageReady]).then(([{TravellingCamera}])=>{
  if(done)return;model=new TravellingCamera(()=>!done,stage);
  if(!model.gl){showFallback();return}
  model.resize();model.setLogoTargets(intro.querySelector('img'),intro.querySelector('.launch-identity').clientWidth);
  const box=model.el.getBoundingClientRect();lastSize=`${Math.round(box.width)}:${Math.round(box.height)}:${Math.round(intro.querySelector('.launch-identity').clientWidth)}:${Math.min(2,devicePixelRatio||1)}`;
  // Compile and paint the first camera pose while hidden, then begin on a clean frame.
  model.drawIntro(0);
  raf=requestAnimationFrame(()=>{
   raf=0;if(done)return;intro.classList.add('is-playing');lastTime=0;
   clearTimeout(failsafe);failsafe=setTimeout(finish,9000);
   if(!document.hidden)raf=requestAnimationFrame(tick);
  });
 }).catch(error=>{console.warn('MMM intro fallback:',error);showFallback();});
})();
